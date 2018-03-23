import Countries from '../../data/countries'

let [query, mutation, resolvers] = [{}, {}, {}];

query.countries = () => Countries;

exports.query = query;
exports.mutation = mutation;
exports.resolvers = resolvers;
