import Countries from '../../../../config/countries'

const countries = ():Array<{code:string, name:string, abbr: string}> => Countries;

export const query =  { countries }
export const mutation =  {}
