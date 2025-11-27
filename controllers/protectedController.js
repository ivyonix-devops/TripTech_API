const getProtectedData = (req, res) => {
  res.json({ msg: 'This is protected data', user: req.user });
};

export { getProtectedData };
