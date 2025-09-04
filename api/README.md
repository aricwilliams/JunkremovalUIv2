# Junk Removal Business Authentication API

A complete authentication API for junk removal businesses to sign up and log in to the SaaS platform.

## Features

- ✅ Business registration with comprehensive validation
- ✅ Secure login with JWT tokens
- ✅ Profile management (get/update)
- ✅ Password hashing with bcrypt
- ✅ Rate limiting for security
- ✅ Input validation with Joi
- ✅ MySQL database integration
- ✅ Comprehensive error handling
- ✅ Test suite included

## Quick Start

### 1. Install Dependencies
```bash
cd api
npm install
```

### 2. Database Setup
1. Create a MySQL database named `junk_removal_db`
2. Run the SQL script to create the businesses table:
```bash
mysql -u root -p junk_removal_db < ../database/businesses_table.sql
```

### 3. Environment Configuration
```bash
cp env.example .env
```

Edit `.env` with your database credentials:
```env
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your_password
DB_NAME=junk_removal_db
JWT_SECRET=your_super_secret_jwt_key_here
```

### 4. Start the Server
```bash
# Development
npm run dev

# Production
npm start
```

### 5. Test the API
```bash
npm test
```

## API Endpoints

### Base URL
```
http://localhost:3000/api/v1/auth
```

### 1. Business Signup
**POST** `/signup`

### 2. Business Login
**POST** `/login`

### 3. Get Profile
**GET** `/profile` (requires authentication)

### 4. Update Profile
**PUT** `/profile` (requires authentication)

## Database Schema

The API uses a single `businesses` table with the following key fields:
- `id` (auto-incrementing primary key)
- Business information (name, phone, address, etc.)
- Owner information (name, email, phone)
- Account credentials (username, password_hash)
- Status and timestamps

## Security Features

- **Password Hashing**: bcrypt with 12 salt rounds
- **JWT Tokens**: Secure authentication with configurable expiration
- **Rate Limiting**: Prevents brute force attacks
- **Input Validation**: Comprehensive validation with Joi
- **CORS Protection**: Configurable cross-origin requests
- **Helmet**: Security headers

## Error Handling

The API returns consistent error responses:
```json
{
  "success": false,
  "message": "Error description",
  "error": "ERROR_CODE"
}
```

## Testing

Run the comprehensive test suite:
```bash
npm test
```

The test suite covers:
- Business signup
- Business login
- Profile retrieval
- Profile updates
- Invalid credentials
- Unauthorized access

## Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `DB_HOST` | Database host | localhost |
| `DB_USER` | Database user | root |
| `DB_PASSWORD` | Database password | (empty) |
| `DB_NAME` | Database name | junk_removal_db |
| `DB_PORT` | Database port | 3306 |
| `JWT_SECRET` | JWT signing secret | (required) |
| `JWT_EXPIRES_IN` | Token expiration | 24h |
| `PORT` | Server port | 3000 |
| `NODE_ENV` | Environment | development |

## API Documentation

See the complete API documentation in the main project README or run the test suite to see example requests and responses.

## Development

### Project Structure
```
api/
├── config/
│   └── database.js          # Database configuration
├── controllers/
│   └── authController.js    # Authentication logic
├── middleware/
│   ├── auth.js             # JWT authentication
│   └── validation.js       # Input validation
├── routes/
│   └── auth.js             # API routes
├── server.js               # Main server file
├── test-auth-endpoints.js  # Test suite
└── package.json            # Dependencies
```

### Adding New Features

1. **New Endpoints**: Add routes in `routes/auth.js`
2. **New Controllers**: Add methods in `controllers/authController.js`
3. **New Validation**: Add schemas in `middleware/validation.js`
4. **Database Changes**: Update the SQL schema and run migrations

## Production Deployment

1. Set `NODE_ENV=production`
2. Use a strong `JWT_SECRET`
3. Configure proper CORS origins
4. Set up SSL/TLS
5. Use a production database
6. Configure proper logging
7. Set up monitoring and health checks

## Support

For issues or questions, please check the test suite first as it demonstrates proper API usage.
