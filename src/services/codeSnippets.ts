import { db } from './firebase';
import { collection, doc, addDoc, getDoc, getDocs, updateDoc, deleteDoc, query, where, orderBy, limit, serverTimestamp, increment, FirestoreError } from 'firebase/firestore';
import { nanoid } from 'nanoid';
import { CodeSnippet } from '../types';

// Helper function to get user profile data
async function getUserProfile(userId: string): Promise<{ displayName: string | null, photoURL: string | null, username?: string | null }> {
  try {
    const userRef = doc(db, 'users', userId);
    const userDoc = await getDoc(userRef);
    
    if (userDoc.exists()) {
      const userData = userDoc.data();
      return {
        displayName: userData.displayName || null,
        photoURL: userData.photoURL || null,
        username: userData.username || null
      };
    }
    
    return {
      displayName: null,
      photoURL: null,
      username: null
    };
  } catch (error) {
    console.error('Error fetching user profile:', error);
    return {
      displayName: null,
      photoURL: null,
      username: null
    };
  }
}

// Create a new code snippet
export async function saveCodeSnippet(
  userId: string,
  title: string,
  description: string,
  code: string,
  language: string,
  tags: string[],
  isPublic: boolean = false
): Promise<CodeSnippet> {
  try {
    // Generate a unique shareable link ID if the snippet is public
    const shareableLink = isPublic ? nanoid(10) : null;
    
    const snippetData = {
      userId,
      title,
      description,
      code,
      language,
      tags,
      isPublic,
      shareableLink,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
      views: 0,
      likes: 0
    };
    
    const docRef = await addDoc(collection(db, 'snippets'), snippetData);
    
    return {
      id: docRef.id,
      ...snippetData,
      createdAt: new Date().toISOString(), // Convert for frontend use
      updatedAt: new Date().toISOString()
    } as CodeSnippet;
  } catch (error) {
    console.error('Error saving code snippet:', error);
    throw error;
  }
}

// Get all code snippets for a user
export async function getUserCodeSnippets(userId: string): Promise<CodeSnippet[]> {
  try {
    const snippetsRef = collection(db, 'snippets');
    const q = query(
      snippetsRef,
      where('userId', '==', userId),
      orderBy('updatedAt', 'desc')
    );
    
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map((doc) => {
      const data = doc.data();
      return {
        id: doc.id,
        ...data,
        createdAt: data.createdAt?.toDate().toISOString() || new Date().toISOString(),
        updatedAt: data.updatedAt?.toDate().toISOString() || new Date().toISOString()
      } as CodeSnippet;
    });
  } catch (error) {
    // Check if the error is related to missing index
    const firestoreError = error as FirestoreError;
    if (firestoreError.code === 'failed-precondition' && firestoreError.message.includes('requires an index')) {
      console.error('Missing Firestore index:', firestoreError.message);
      // Fallback to a simpler query without ordering when index is missing
      try {
        console.log('Attempting fallback query without ordering...');
        const fallbackQuery = query(
          collection(db, 'snippets'),
          where('userId', '==', userId)
        );
        
        const fallbackSnapshot = await getDocs(fallbackQuery);
        const snippets = fallbackSnapshot.docs.map((doc) => {
          const data = doc.data();
          return {
            id: doc.id,
            ...data,
            createdAt: data.createdAt?.toDate().toISOString() || new Date().toISOString(),
            updatedAt: data.updatedAt?.toDate().toISOString() || new Date().toISOString()
          } as CodeSnippet;
        });
        
        // Client-side sorting as a fallback
        return snippets.sort((a, b) => 
          new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
        );
      } catch (fallbackError) {
        console.error('Fallback query also failed:', fallbackError);
        throw new Error(`Please create the required Firestore index by visiting the URL in the original error message. Original error: ${firestoreError.message}`);
      }
    }
    
    console.error('Error fetching user snippets:', error);
    throw error;
  }
}

// Get a single code snippet
export async function getCodeSnippet(snippetId: string): Promise<CodeSnippet> {
  try {
    const snippetRef = doc(db, 'snippets', snippetId);
    const snippetDoc = await getDoc(snippetRef);
    
    if (!snippetDoc.exists()) {
      throw new Error('Snippet not found');
    }
    
    const data = snippetDoc.data();
    return {
      id: snippetDoc.id,
      ...data,
      createdAt: data.createdAt?.toDate().toISOString() || new Date().toISOString(),
      updatedAt: data.updatedAt?.toDate().toISOString() || new Date().toISOString()
    } as CodeSnippet;
  } catch (error) {
    console.error('Error fetching snippet:', error);
    throw error;
  }
}

// Get a code snippet by its shareable link
export async function getCodeSnippetByShareableLink(shareableLink: string): Promise<CodeSnippet | null> {
  try {
    const snippetsRef = collection(db, 'snippets');
    const q = query(
      snippetsRef,
      where('shareableLink', '==', shareableLink),
      where('isPublic', '==', true)
    );
    
    const querySnapshot = await getDocs(q);
    
    if (querySnapshot.empty) {
      return null;
    }
    
    const doc = querySnapshot.docs[0];
    const data = doc.data();
    
    // Fetch creator information
    const userId = data.userId;
    const userProfile = await getUserProfile(userId);
    
    return {
      id: doc.id,
      ...data,
      createdAt: data.createdAt?.toDate().toISOString() || new Date().toISOString(),
      updatedAt: data.updatedAt?.toDate().toISOString() || new Date().toISOString(),
      creatorName: userProfile.displayName,
      creatorPhotoURL: userProfile.photoURL,
      creatorUsername: userProfile.username || null
    } as CodeSnippet;
  } catch (error) {
    console.error('Error fetching shared snippet:', error);
    throw error;
  }
}

// Update an existing code snippet
export async function updateCodeSnippet(
  snippetId: string,
  updates: Partial<CodeSnippet>
): Promise<CodeSnippet> {
  try {
    const snippetRef = doc(db, 'snippets', snippetId);
    
    // Make sure to add updatedAt timestamp
    const updateData = {
      ...updates,
      updatedAt: serverTimestamp()
    };
    
    // Remove id if it exists to avoid errors
    if ('id' in updateData) {
      delete updateData.id;
    }
    
    await updateDoc(snippetRef, updateData);
    
    // Fetch the updated document
    const updatedSnippet = await getCodeSnippet(snippetId);
    return updatedSnippet;
  } catch (error) {
    console.error('Error updating snippet:', error);
    throw error;
  }
}

// Update snippet visibility (public/private)
export async function updateCodeSnippetVisibility(
  snippetId: string,
  isPublic: boolean
): Promise<CodeSnippet> {
  try {
    const snippetRef = doc(db, 'snippets', snippetId);
    const snippetDoc = await getDoc(snippetRef);
    
    if (!snippetDoc.exists()) {
      throw new Error('Snippet not found');
    }
    
    // Generate a new shareable link if making public and doesn't have one
    let updateData: any = { isPublic, updatedAt: serverTimestamp() };
    
    if (isPublic) {
      const currentData = snippetDoc.data();
      if (!currentData.shareableLink) {
        updateData.shareableLink = nanoid(10);
      }
    }
    
    await updateDoc(snippetRef, updateData);
    
    // Fetch the updated document
    return await getCodeSnippet(snippetId);
  } catch (error) {
    console.error('Error updating snippet visibility:', error);
    throw error;
  }
}

// Delete a code snippet
export async function deleteCodeSnippet(snippetId: string): Promise<void> {
  try {
    const snippetRef = doc(db, 'snippets', snippetId);
    await deleteDoc(snippetRef);
  } catch (error) {
    console.error('Error deleting snippet:', error);
    throw error;
  }
}

// Search for code snippets by title, description or tags
export async function searchUserCodeSnippets(
  userId: string,
  searchTerm: string
): Promise<CodeSnippet[]> {
  try {
    // Get all user snippets first (Firebase doesn't support text search)
    const snippets = await getUserCodeSnippets(userId);
    
    // Filter client-side
    const searchLower = searchTerm.toLowerCase();
    return snippets.filter((snippet) => {
      return (
        snippet.title.toLowerCase().includes(searchLower) ||
        (snippet.description?.toLowerCase().includes(searchLower)) ||
        snippet.tags?.some(tag => tag.toLowerCase().includes(searchLower))
      );
    });
  } catch (error) {
    console.error('Error searching snippets:', error);
    throw error;
  }
}

// Get recent code snippets
export async function getRecentCodeSnippets(userId: string, count: number = 5): Promise<CodeSnippet[]> {
  try {
    const snippetsRef = collection(db, 'snippets');
    const q = query(
      snippetsRef,
      where('userId', '==', userId),
      orderBy('updatedAt', 'desc'),
      limit(count)
    );
    
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map((doc) => {
      const data = doc.data();
      return {
        id: doc.id,
        ...data,
        createdAt: data.createdAt?.toDate().toISOString() || new Date().toISOString(),
        updatedAt: data.updatedAt?.toDate().toISOString() || new Date().toISOString()
      } as CodeSnippet;
    });
  } catch (error) {
    console.error('Error fetching recent snippets:', error);
    throw error;
  }
}

// Get popular public snippets
export async function getPopularPublicSnippets(count: number = 10): Promise<CodeSnippet[]> {
  try {
    const snippetsRef = collection(db, 'snippets');
    const q = query(
      snippetsRef,
      where('isPublic', '==', true),
      orderBy('views', 'desc'),
      limit(count)
    );
    
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map((doc) => {
      const data = doc.data();
      return {
        id: doc.id,
        ...data,
        createdAt: data.createdAt?.toDate().toISOString() || new Date().toISOString(),
        updatedAt: data.updatedAt?.toDate().toISOString() || new Date().toISOString()
      } as CodeSnippet;
    });
  } catch (error) {
    console.error('Error fetching popular snippets:', error);
    throw error;
  }
}

// Increment snippet view count
export async function incrementSnippetViews(snippetId: string): Promise<void> {
  try {
    const snippetRef = doc(db, 'snippets', snippetId);
    await updateDoc(snippetRef, {
      views: increment(1)
    });
  } catch (error) {
    console.error('Error incrementing view count:', error);
    // Don't throw error to prevent affecting user experience
  }
}

// Increment snippet like count
export async function incrementSnippetLikes(snippetId: string): Promise<void> {
  try {
    const snippetRef = doc(db, 'snippets', snippetId);
    await updateDoc(snippetRef, {
      likes: increment(1)
    });
  } catch (error) {
    console.error('Error incrementing like count:', error);
    throw error;
  }
}

// Get all public snippets
export async function getAllPublicSnippets(): Promise<CodeSnippet[]> {
  try {
    const snippetsRef = collection(db, 'snippets');
    const q = query(
      snippetsRef,
      where('isPublic', '==', true),
      orderBy('updatedAt', 'desc')
    );
    
    const querySnapshot = await getDocs(q);
    const snippets = querySnapshot.docs.map((doc) => {
      const data = doc.data();
      return {
        id: doc.id,
        ...data,
        createdAt: data.createdAt?.toDate().toISOString() || new Date().toISOString(),
        updatedAt: data.updatedAt?.toDate().toISOString() || new Date().toISOString()
      } as CodeSnippet;
    });
    
    // Fetch creator information for all snippets
    for (const snippet of snippets) {
      const userProfile = await getUserProfile(snippet.userId);
      snippet.creatorName = userProfile.displayName;
      snippet.creatorPhotoURL = userProfile.photoURL;
      snippet.creatorUsername = userProfile.username || null;
    }
    
    return snippets;
  } catch (error) {
    console.error('Error fetching all public snippets:', error);
    
    // Handle missing index error gracefully
    const firestoreError = error as FirestoreError;
    if (firestoreError.code === 'failed-precondition' && firestoreError.message.includes('requires an index')) {
      console.error('Missing Firestore index:', firestoreError.message);
      
      // Fallback to a simpler query without ordering
      try {
        console.log('Attempting fallback query without ordering...');
        const fallbackQuery = query(
          collection(db, 'snippets'),
          where('isPublic', '==', true)
        );
        
        const fallbackSnapshot = await getDocs(fallbackQuery);
        const snippets = fallbackSnapshot.docs.map((doc) => {
          const data = doc.data();
          return {
            id: doc.id,
            ...data,
            createdAt: data.createdAt?.toDate().toISOString() || new Date().toISOString(),
            updatedAt: data.updatedAt?.toDate().toISOString() || new Date().toISOString()
          } as CodeSnippet;
        });
        
        // Fetch creator information for all snippets in fallback case
        for (const snippet of snippets) {
          const userProfile = await getUserProfile(snippet.userId);
          snippet.creatorName = userProfile.displayName;
          snippet.creatorPhotoURL = userProfile.photoURL;
          snippet.creatorUsername = userProfile.username || null;
        }
        
        // Client-side sorting as a fallback
        return snippets.sort((a, b) => 
          new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
        );
      } catch (fallbackError) {
        console.error('Fallback query also failed:', fallbackError);
        throw new Error(`Please create the required Firestore index by visiting the URL in the original error message. Original error: ${firestoreError.message}`);
      }
    }
    
    throw error;
  }
}

// Get public snippets for a specific user
export async function getPublicSnippetsByUserId(userId: string): Promise<CodeSnippet[]> {
  try {
    const snippetsRef = collection(db, 'snippets');
    const q = query(
      snippetsRef,
      where('userId', '==', userId),
      where('isPublic', '==', true),
      orderBy('updatedAt', 'desc')
    );
    
    const querySnapshot = await getDocs(q);
    const snippets = querySnapshot.docs.map((doc) => {
      const data = doc.data();
      return {
        id: doc.id,
        ...data,
        createdAt: data.createdAt?.toDate().toISOString() || new Date().toISOString(),
        updatedAt: data.updatedAt?.toDate().toISOString() || new Date().toISOString()
      } as CodeSnippet;
    });
    
    // Fetch creator information for all snippets
    for (const snippet of snippets) {
      const userProfile = await getUserProfile(snippet.userId);
      snippet.creatorName = userProfile.displayName;
      snippet.creatorPhotoURL = userProfile.photoURL;
      snippet.creatorUsername = userProfile.username || null;
    }
    
    return snippets;
  } catch (error) {
    console.error('Error fetching public snippets for user:', error);
    
    // Handle missing index error gracefully (same as in getAllPublicSnippets)
    const firestoreError = error as FirestoreError;
    if (firestoreError.code === 'failed-precondition' && firestoreError.message.includes('requires an index')) {
      console.error('Missing Firestore index:', firestoreError.message);
      
      // Fallback to a simpler query without ordering
      try {
        console.log('Attempting fallback query without ordering...');
        const fallbackQuery = query(
          collection(db, 'snippets'),
          where('userId', '==', userId),
          where('isPublic', '==', true)
        );
        
        const fallbackSnapshot = await getDocs(fallbackQuery);
        const snippets = fallbackSnapshot.docs.map((doc) => {
          const data = doc.data();
          return {
            id: doc.id,
            ...data,
            createdAt: data.createdAt?.toDate().toISOString() || new Date().toISOString(),
            updatedAt: data.updatedAt?.toDate().toISOString() || new Date().toISOString()
          } as CodeSnippet;
        });
        
        // Fetch creator information for all snippets in fallback case
        for (const snippet of snippets) {
          const userProfile = await getUserProfile(snippet.userId);
          snippet.creatorName = userProfile.displayName;
          snippet.creatorPhotoURL = userProfile.photoURL;
          snippet.creatorUsername = userProfile.username || null;
        }
        
        // Client-side sorting as a fallback
        return snippets.sort((a, b) => 
          new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
        );
      } catch (fallbackError) {
        console.error('Fallback query also failed:', fallbackError);
        throw new Error(`Please create the required Firestore index by visiting the URL in the original error message. Original error: ${firestoreError.message}`);
      }
    }
    
    throw error;
  }
}