# 🤝 Contributing to MIA Logistics Manager

Cảm ơn bạn đã quan tâm đến việc đóng góp cho MIA Logistics Manager! Tài liệu này sẽ hướng dẫn bạn quy trình đóng góp.

## 📋 Mục lục

- [Code of Conduct](#code-of-conduct)
- [Getting Started](#getting-started)
- [Development Process](#development-process)
- [Coding Standards](#coding-standards)
- [Commit Guidelines](#commit-guidelines)
- [Pull Request Process](#pull-request-process)
- [Testing Guidelines](#testing-guidelines)
- [Documentation](#documentation)

## 🤝 Code of Conduct

### Nguyên tắc cơ bản

- **Tôn trọng**: Tôn trọng tất cả contributors, bất kể kinh nghiệm hay background
- **Chuyên nghiệp**: Giữ giao tiếp chuyên nghiệp và mang tính xây dựng
- **Cởi mở**: Chấp nhận feedback và sẵn sàng học hỏi
- **Hợp tác**: Làm việc cùng nhau để tạo ra sản phẩm tốt nhất

### Không chấp nhận

- Ngôn ngữ hoặc hình ảnh thiếu tôn trọng
- Tấn công cá nhân hoặc chính trị
- Quấy rối công khai hoặc riêng tư
- Hành vi không chuyên nghiệp khác

## 🚀 Getting Started

### 1. Fork Repository

```bash
# Fork repository trên GitHub
# Clone fork của bạn
git clone https://github.com/your-username/mia-logistics-manager.git
cd mia-logistics-manager

# Add upstream remote
git remote add upstream https://github.com/original-owner/mia-logistics-manager.git
```

### 2. Setup Development Environment

```bash
# Install dependencies
npm install
cd backend && npm install && cd ..

# Copy environment file
cp .env.example .env
# Điền thông tin cần thiết vào .env

# Start development servers
./start-project.sh
```

### 3. Verify Setup

```bash
# Check frontend (should open http://localhost:3000)
# Check backend API (http://localhost:5050/api/health)
curl http://localhost:5050/api/health

# Run tests
npm test
```

## 💻 Development Process

### Branch Strategy

```
main                    # Production code (protected)
├── develop             # Development branch (protected)
├── feature/xxx         # New features
├── bugfix/xxx          # Bug fixes
├── hotfix/xxx          # Urgent production fixes
└── docs/xxx            # Documentation updates
```

### Creating a Branch

```bash
# Update develop branch
git checkout develop
git pull upstream develop

# Create feature branch
git checkout -b feature/your-feature-name

# Or for bugfix
git checkout -b bugfix/issue-number-description
```

### Branch Naming Convention

- **feature/**: Tính năng mới (ví dụ: `feature/add-user-dashboard`)
- **bugfix/**: Sửa bug (ví dụ: `bugfix/123-fix-login-error`)
- **hotfix/**: Fix khẩn cấp production (ví dụ: `hotfix/security-patch`)
- **docs/**: Cập nhật documentation (ví dụ: `docs/update-readme`)
- **refactor/**: Refactor code (ví dụ: `refactor/optimize-api-calls`)
- **test/**: Thêm tests (ví dụ: `test/add-auth-tests`)

## 📝 Coding Standards

### JavaScript/React Style

#### 1. Component Structure

```javascript
// ✅ Good: Functional component với hooks
import React, { useState, useEffect, useCallback } from 'react';
import PropTypes from 'prop-types';

/**
 * User profile component
 * @param {Object} props - Component props
 * @param {Object} props.user - User data object
 * @param {Function} props.onUpdate - Update callback
 */
const UserProfile = ({ user, onUpdate }) => {
  const [isEditing, setIsEditing] = useState(false);

  useEffect(() => {
    // Effect logic
  }, [user]);

  const handleSave = useCallback(() => {
    // Save logic
    onUpdate(user);
  }, [user, onUpdate]);

  return (
    <div className="user-profile">
      {/* JSX content */}
    </div>
  );
};

UserProfile.propTypes = {
  user: PropTypes.object.isRequired,
  onUpdate: PropTypes.func.isRequired
};

export default UserProfile;
```

#### 2. Naming Conventions

```javascript
// Components: PascalCase
const UserProfile = () => {};

// Functions: camelCase
const getUserData = () => {};
const handleSubmit = () => {};

// Constants: UPPER_CASE
const API_BASE_URL = 'http://localhost:5050';
const MAX_RETRY_COUNT = 3;

// Private functions: _prefix (optional)
const _validateInput = (input) => {};

// Boolean variables: is/has/should prefix
const isLoading = true;
const hasPermission = false;
const shouldUpdate = true;
```

#### 3. File Structure

```
src/
  components/
    UserProfile/
      UserProfile.jsx         # Main component
      UserProfile.test.jsx    # Tests
      UserProfile.styles.js   # Styles (if using styled-components)
      index.js               # Export
```

### CSS/Styling

```javascript
// ✅ Good: Tailwind CSS classes
<div className="flex items-center justify-between p-4 bg-white rounded-lg shadow-md">
  <h2 className="text-xl font-semibold text-gray-800">Title</h2>
</div>

// ✅ Good: Material-UI sx prop
<Box sx={{ display: 'flex', gap: 2, p: 2 }}>
  <Typography variant="h6">Title</Typography>
</Box>
```

### Code Quality

#### ESLint Rules

```javascript
// ✅ Good practices
- Use const/let instead of var
- Use === instead of ==
- Handle promises properly (async/await)
- Remove console.log() before commit
- Add PropTypes or TypeScript types
- Use meaningful variable names

// ❌ Avoid
var data = getData(); // Use const or let
if (value == 10) {} // Use ===
promise.then().then(); // Use async/await
console.log('debug'); // Remove before commit
```

## 📦 Commit Guidelines

### Commit Message Format

```
<type>(<scope>): <subject>

<body>

<footer>
```

### Types

- **feat**: Tính năng mới
- **fix**: Bug fix
- **docs**: Documentation changes
- **style**: Code style changes (formatting, no logic change)
- **refactor**: Code refactoring
- **perf**: Performance improvements
- **test**: Adding or updating tests
- **chore**: Maintenance tasks, dependencies update

### Examples

```bash
# Feature
feat(auth): add password reset functionality

Add email-based password reset flow with token validation.
Includes new API endpoints and frontend forms.

Closes #123

# Bug fix
fix(carriers): resolve pagination issue on carriers list

Fix bug where pagination reset to page 1 when filtering.
Now maintains current page after filter application.

Fixes #456

# Documentation
docs(readme): update installation instructions

Add detailed steps for Google Sheets configuration.
Include screenshots for service account setup.

# Refactor
refactor(services): optimize Google Sheets API calls

Reduce API calls by 50% using batch requests and caching.
Improves performance and reduces quota usage.
```

## 🔀 Pull Request Process

### 1. Before Creating PR

```bash
# Update your branch with latest develop
git checkout develop
git pull upstream develop
git checkout your-feature-branch
git rebase develop

# Run tests
npm test

# Run linter
npm run lint

# Build
npm run build
```

### 2. Create Pull Request

**PR Title Format:**

```
[Type] Brief description of changes
```

**Examples:**

- `[Feature] Add user role management`
- `[Fix] Resolve login redirect issue`
- `[Docs] Update API documentation`

**PR Description Template:**

```markdown
## 📝 Description
Brief description of what this PR does.

## 🎯 Type of Change
- [ ] Bug fix (non-breaking change fixing an issue)
- [ ] New feature (non-breaking change adding functionality)
- [ ] Breaking change (fix or feature causing existing functionality to not work as expected)
- [ ] Documentation update

## 🧪 Testing
Describe the tests you ran and how to reproduce:
- [ ] Test A
- [ ] Test B

## 📸 Screenshots (if applicable)
Add screenshots for UI changes

## ✅ Checklist
- [ ] Code follows project style guidelines
- [ ] Self-review completed
- [ ] Comments added for complex logic
- [ ] Documentation updated
- [ ] No new warnings generated
- [ ] Tests added/updated
- [ ] All tests passing
- [ ] PR title follows convention

## 🔗 Related Issues
Closes #123
Related to #456
```

### 3. PR Review Process

1. **Automated Checks**: CI/CD pipeline runs automatically
2. **Code Review**: At least 1 approval required
3. **Changes Requested**: Address feedback and push updates
4. **Approval**: PR approved by maintainer
5. **Merge**: Squash and merge to develop/main

### 4. Review Checklist

**For Reviewers:**

- [ ] Code follows project conventions
- [ ] Logic is correct and efficient
- [ ] Edge cases handled
- [ ] Error handling implemented
- [ ] Tests included and passing
- [ ] Documentation updated
- [ ] No security vulnerabilities
- [ ] Performance impact acceptable

## 🧪 Testing Guidelines

### Writing Tests

#### Unit Tests

```javascript
// Example: Testing a utility function
import { formatCurrency } from './utils';

describe('formatCurrency', () => {
  it('formats number as VND currency', () => {
    expect(formatCurrency(1000000)).toBe('1.000.000 ₫');
  });

  it('handles zero value', () => {
    expect(formatCurrency(0)).toBe('0 ₫');
  });

  it('handles negative values', () => {
    expect(formatCurrency(-5000)).toBe('-5.000 ₫');
  });
});
```

#### Component Tests

```javascript
// Example: Testing a React component
import { render, screen, fireEvent } from '@testing-library/react';
import UserProfile from './UserProfile';

describe('UserProfile', () => {
  const mockUser = { id: 1, name: 'Test User', email: 'test@test.com' };
  const mockOnUpdate = jest.fn();

  it('renders user information', () => {
    render(<UserProfile user={mockUser} onUpdate={mockOnUpdate} />);
    expect(screen.getByText('Test User')).toBeInTheDocument();
    expect(screen.getByText('test@test.com')).toBeInTheDocument();
  });

  it('calls onUpdate when save button clicked', () => {
    render(<UserProfile user={mockUser} onUpdate={mockOnUpdate} />);
    fireEvent.click(screen.getByText('Save'));
    expect(mockOnUpdate).toHaveBeenCalledWith(mockUser);
  });
});
```

### Test Coverage

- **Minimum**: 70% overall coverage
- **Critical paths**: 100% coverage required
- **New features**: Must include tests

```bash
# Run tests with coverage
npm test -- --coverage

# View coverage report
open coverage/lcov-report/index.html
```

## 📚 Documentation

### Code Documentation

```javascript
/**
 * Fetch user data from API
 *
 * @param {string} userId - The user ID to fetch
 * @param {Object} options - Optional fetch options
 * @param {boolean} options.includeOrders - Include user orders in response
 * @returns {Promise<Object>} User data object
 * @throws {Error} If user not found or network error
 *
 * @example
 * const user = await fetchUserData('123', { includeOrders: true });
 */
async function fetchUserData(userId, options = {}) {
  // Implementation
}
```

### API Documentation

Cập nhật API documentation khi thêm/sửa endpoints:

```javascript
/**
 * @route   GET /api/users/:id
 * @desc    Get user by ID
 * @access  Private
 *
 * @param   {string} id - User ID
 * @returns {Object} User object
 *
 * @example
 * GET /api/users/123
 * Response: { id: '123', name: 'User', email: 'user@test.com' }
 */
```

### README Updates

Khi thêm features mới:

1. Update feature list trong README
2. Add usage examples
3. Update API endpoints list
4. Add configuration if needed

## 🐛 Reporting Bugs

### Bug Report Template

```markdown
**Describe the bug**
Clear description of what the bug is.

**To Reproduce**
Steps to reproduce:
1. Go to '...'
2. Click on '...'
3. Scroll down to '...'
4. See error

**Expected behavior**
What you expected to happen.

**Screenshots**
If applicable, add screenshots.

**Environment:**
- OS: [e.g. macOS 12.0]
- Browser: [e.g. Chrome 95]
- Node version: [e.g. 18.0.0]
- Version: [e.g. 2.1.1]

**Additional context**
Any other context about the problem.
```

## 💡 Feature Requests

### Feature Request Template

```markdown
**Is your feature request related to a problem?**
Clear description of the problem.

**Describe the solution you'd like**
Clear description of what you want to happen.

**Describe alternatives you've considered**
Other solutions you've thought about.

**Additional context**
Mockups, examples, or other context.
```

## 📞 Getting Help

### Resources

- **Documentation**: Check README.md and docs/ folder
- **Issues**: Search existing issues on GitHub
- **Discussions**: GitHub Discussions for questions

### Contact

- **Email**: <kho.1@mia.vn>
- **Telegram**: [MIA Logistics Group]
- **GitHub Issues**: For bug reports and features

## 🎉 Recognition

Contributors will be recognized in:

- README.md contributors section
- Release notes
- GitHub contributors page

Thank you for contributing to MIA Logistics Manager! 🚀
