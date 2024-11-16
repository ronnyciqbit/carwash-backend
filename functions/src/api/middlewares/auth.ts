import {NextFunction, Request, Response} from "express";
import * as admin from "firebase-admin";

export const authenticate = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  const authorizationHeader = req.headers.authorization;

  if (!authorizationHeader || !authorizationHeader.startsWith("Bearer ")) {
    res.status(401).json({message: "Unauthorized"});
    return;
  }

  const idToken = authorizationHeader.split("Bearer ")[1];

  try {
    const decodedToken = await admin.auth().verifyIdToken(idToken);
    (req as any).user = decodedToken;
    next();
  } catch (error) {
    res.status(401).json({message: "Unauthorized"});
  }
};
