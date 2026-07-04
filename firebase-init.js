/* ========================================
   APEXPLAY - Firebase Initialization & Database
   Handles Global Leaderboards
   ======================================== */

const firebaseConfig = {
  apiKey: "AIzaSyBKIUaWkxoN_neh3BoBjHH8OaSvQdAx0WE",
  authDomain: "apexplay-e64ac.firebaseapp.com",
  projectId: "apexplay-e64ac",
  storageBucket: "apexplay-e64ac.firebasestorage.app",
  messagingSenderId: "483995105536",
  appId: "1:483995105536:web:1373110519858a31715be5"
};

// Initialize Firebase (using compat mode via CDN)
firebase.initializeApp(firebaseConfig);
const db = firebase.firestore();

// Ensure user has a username
let currentUser = localStorage.getItem('apexplay_username');
if (!currentUser) {
  currentUser = prompt("Welcome to ApexPlay! Enter a username for the Global Leaderboards:");
  if (!currentUser) {
    currentUser = "Player" + Math.floor(Math.random() * 9999);
  }
  localStorage.setItem('apexplay_username', currentUser);
}

const DB = {
  /**
   * Save a score to the global leaderboard
   * @param {string} gameId - e.g., 'tetris', 'flappy'
   * @param {number} score - The score to save
   * @param {boolean} lowerIsBetter - true if a lower score is better (like time/moves)
   */
  saveScore: async (gameId, score, lowerIsBetter = false) => {
    try {
      await db.collection('leaderboards').doc(gameId).collection('scores').add({
        username: currentUser,
        score: score,
        timestamp: firebase.firestore.FieldValue.serverTimestamp()
      });
      console.log(`Global score saved for ${gameId}: ${score}`);
    } catch (error) {
      console.error("Error saving global score:", error);
    }
  },

  /**
   * Get the top 10 scores for a game
   * @param {string} gameId 
   * @param {boolean} lowerIsBetter 
   */
  getLeaderboard: async (gameId, lowerIsBetter = false) => {
    try {
      const snapshot = await db.collection('leaderboards')
        .doc(gameId)
        .collection('scores')
        .orderBy('score', lowerIsBetter ? 'asc' : 'desc')
        .limit(10)
        .get();
        
      return snapshot.docs.map(doc => doc.data());
    } catch (error) {
      console.error("Error getting leaderboard:", error);
      return [];
    }
  }
};
