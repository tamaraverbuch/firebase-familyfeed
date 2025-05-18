
import { Request, Response, NextFunction } from 'express';
import { adminAuth } from './firebaseAdmin';
import { storage } from './storage';


export interface AuthRequest extends Request {
  user?: {
    uid: string;
    email?: string;
    displayName?: string;
    photoURL?: string;
    
    claims?: {
      sub: string;
      email?: string;
      [key: string]: any;
    };
  };
  file?: {
    buffer: Buffer;
    originalname: string;
    mimetype: string;
    size: number;
    [key: string]: any;
  };
}

/**
 * Middleware to validate Firebase token and attach user to request
 */
export const isAuthenticated = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ message: 'Unauthorized - No token provided' });
    }
    
    const token = authHeader.split('Bearer ')[1];
    
    if (!token) {
      return res.status(401).json({ message: 'Unauthorized - Invalid token format' });
    }
    
   
    const decodedToken = await adminAuth.verifyIdToken(token);
    

    const { sub, ...tokenWithoutSub } = decodedToken;
    

    req.user = {
      uid: decodedToken.uid,
      email: decodedToken.email,
      displayName: decodedToken.name,
      photoURL: decodedToken.picture,
 
      claims: {
        sub: decodedToken.uid,
        email: decodedToken.email,
        
        ...tokenWithoutSub
      }
    };
    
 
    await syncFirebaseUser(decodedToken);
    
    next();
  } catch (error) {
    console.error('Error verifying auth token:', error);
    return res.status(401).json({ message: 'Unauthorized - Invalid token' });
  }
};

/**
 * syncs Firebase user data with db
 * ensures user profile is up-to-date after each authentication
 */
async function syncFirebaseUser(decodedToken: any) {
  try {
    // update user in db (upsert will create if not exists)
    await storage.upsertUser({
      id: decodedToken.uid,
      email: decodedToken.email || '',
      firstName: decodedToken.name ? decodedToken.name.split(' ')[0] : '',
      lastName: decodedToken.name ? decodedToken.name.split(' ').slice(1).join(' ') : '',
      profileImageUrl: decodedToken.picture || ''
    });
  } catch (error) {
    console.error('Error syncing Firebase user with database:', error);
  }
}

/**
 * sets up authentication related endpoints
 */
export function setupFirebaseAuth(app: any) {
  console.log('Setting up Firebase Authentication');
  
  // add auth status endpoint
  app.get('/api/auth/status', isAuthenticated, (req: AuthRequest, res: Response) => {
    return res.status(200).json({
      authenticated: true,
      user: req.user
    });
  });
  
  // add token verification endpoint (useful for client validation)
  app.post('/api/verify-token', async (req: AuthRequest, res: Response) => {
    try {
      const { token } = req.body;
      
      if (!token) {
        return res.status(400).json({ message: 'No token provided' });
      }
      
    
      const decodedToken = await adminAuth.verifyIdToken(token);
      
      return res.status(200).json({ 
        authenticated: true,
        uid: decodedToken.uid
      });
    } catch (error) {
      console.error('Error verifying token:', error);
      return res.status(401).json({ 
        authenticated: false,
        message: 'Invalid token' 
      });
    }
  });
  
  //  add server-side logout endpoint for API consistency
  app.post('/api/logout', (req: AuthRequest, res: Response) => {
    return res.status(200).json({ success: true });
  });
}