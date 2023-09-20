const { ApolloServer, gql } = require("apollo-server");
const fetch = require("node-fetch");
let countries = []; 

const typeDefs = gql`
  type Country {
    code: String
    name: String
    emoji: String
    phone: String
    emojiU: String
    native: String
    phones: [String]
    states: [State]
    capital: String
    currency: String
    awsRegion: String
    continent: Continent
    currencies: [String]
    languages: [Language]
  }

  type State {
    code: String
  }

  type Continent {
    code: String
    name: String
    countries: [Country]
  }

  type Language {
    rtl: Boolean
    code: String
    name: String
    native: String
  }

  type Query {
    countries: [Country]
  }

  input StateInput {
    code: String
  }

   type Mutation {
    addCountry(code: String!, name: String!, emoji: String, phone: String, emojiU: String, native: String, phones: [String], states: [StateInput], capital: String, currency: String, awsRegion: String, continent: ContinentInput, currencies: [String], languages: [LanguageInput]): Country
    updateCountry(code: String!, name: String): Country
    deleteCountry(code: String!): Boolean
  }

  input ContinentInput {
    code: String!
    name: String
    countries: [CountryInput]
  }

  input LanguageInput {
    rtl: Boolean
    code: String!
    name: String
    native: String
  }

  input CountryInput {
    code: String
    name: String
    emoji: String
    phone: String
    emojiU: String
    native: String
    phones: [String]
    states: [StateInput]
    capital: String
    currency: String
    awsRegion: String
    continent: ContinentInput
    currencies: [String]
    languages: [LanguageInput]
  }
`;

const resolvers = {
  Query: {
    countries: async () => {
      const response = await fetch("https://countries.trevorblades.com/", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          query: `
            {
              countries {
                code
                name
                emoji
                phone
                emojiU
                native
                phones
                states {
                  code
                }
                capital
                currency
                awsRegion
                continent {
                  code
                  name
                  countries {
                    capital
                    currency
                  }
                }
                currencies
                languages {
                  rtl
                  code
                  name
                  native
                }
              }
            }
          `,
        }),
      });

      const data = await response.json();
      return data.data.countries;
    },
  },
  Mutation: {
    addCountry: (_, args) => {
      const newCountry = {
        ...args
    };
      countries.push(newCountry);
      return newCountry;
    },

    updateCountry: (_, { code, name }) => {
      const country = countries.find((c) => c.code === code);
      if (!country) throw new Error('Country not found');

      if (name) {
        country.name = name;
      }

      // 기타 업데이트 로직 추가 가능
      return country;
    },

    deleteCountry: (_, { code }) => {
      const countryIndex = countries.findIndex((c) => c.code === code);
      if (countryIndex === -1) throw new Error('Country not found');

      countries.splice(countryIndex, 1);
      return true;  
    },
  },
};

const server = new ApolloServer({
  typeDefs,
  resolvers,
});

server.listen().then(({ url }) => {
  console.log(`🚀 Server ready at ${url}`);
});
