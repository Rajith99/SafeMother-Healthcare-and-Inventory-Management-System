
import { UserRepository } from '../repositories/UserRepository.js';
import '../config/env.js'; 
import { connectDB } from '../config/database.js';

(async () => {
  try {
    await connectDB();
    const repo = new UserRepository();
    const adminEmail = 'admin@safemother.com';
    const admin = await repo.findByEmail(adminEmail);
    if (!admin) {
      console.error('Admin user not found');
      process.exit(1);
    }
    const newHash = '$2b$10$uEG5hF6k6NqV2VNN674OxuJA8Kr2lm0stuMA.6Aw.TUkJyQGuNmwy';
    await repo.updatePassword(admin._id, newHash); 
    
    const pool = (await import('../config/database.js')).getPool();
    await pool.request()
      .input('id', pool.sql.Int, admin._id)
      .input('password', pool.sql.NVarChar(255), newHash)
      .query('UPDATE Users SET Password = @password, UpdatedAt = GETDATE() WHERE UserID = @id');
    console.log('Admin password reset successfully');
  } catch (err) {
    console.error('Error resetting admin password:', err);
    process.exit(1);
  }
})();
