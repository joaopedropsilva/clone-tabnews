function status(request, response) {
  response.status(200).json({ msg: 'Deu Bom né amigos' })
}

export default status