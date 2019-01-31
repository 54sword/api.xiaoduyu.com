import Countries from '../../data/countries'

let [query, mutation, resolvers] = [{}, {}, {}];

query.countries = () => Countries;

export { query, mutation, resolvers }
