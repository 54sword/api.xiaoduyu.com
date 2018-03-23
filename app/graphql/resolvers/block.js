

let [query, mutation, resolvers] = [{}, {}, {}];


query.blocks = () => ({ success: true });
mutation.addBlock = () => ({ success: true });
mutation.removeBlock = () => ({ success: true });

exports.query = query;
exports.mutation = mutation;
exports.resolvers = resolvers;
