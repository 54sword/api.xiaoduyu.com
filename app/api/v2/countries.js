
import Countries from '../../data/countries'

exports.fetch = (req, res, next) => {

  res.send({
    success: true,
    data: Countries
  })

}
