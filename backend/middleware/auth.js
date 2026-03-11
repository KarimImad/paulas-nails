export const isAuthenticated = (req, res, next) => {
  if (req.isAuthenticated()) return next();
  res.status(401).json({ message: 'Vous devez être connecté pour accéder à cette ressource.' });
};

export const isAdmin = (req, res, next) => {
  if (req.isAuthenticated() && req.user.role === 'admin') return next();
  res.status(403).json({ message: 'Accès réservé aux administrateurs.' });
};
