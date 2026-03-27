const authMiddleware= (req, res, next) => {
  try {
    const userId = req.cookies.userId;

    // check if cookie exists
    if (!userId) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    // attach user to request
    req.user = { id: userId };

    next(); // go to controller

  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
};

module.exports=authMiddleware;