#!/bin/bash

# ========================================
# MIA.vn Logistics - Feature Generator
# ========================================
# Script để tạo một feature module hoàn chỉnh
# Usage: ./scripts/generate-feature.sh <feature-name>
# Example: ./scripts/generate-feature.sh customers

set -e

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
NC='\033[0m'

# Check arguments
if [ $# -eq 0 ]; then
    echo -e "${RED}Error: Feature name is required${NC}"
    echo "Usage: ./scripts/generate-feature.sh <feature-name>"
    echo "Example: ./scripts/generate-feature.sh customers"
    exit 1
fi

FEATURE_NAME=$1
FEATURE_NAME_LOWER=$(echo "$FEATURE_NAME" | tr '[:upper:]' '[:lower:]')
FEATURE_NAME_UPPER=$(echo "$FEATURE_NAME" | awk '{print toupper(substr($0,1,1)) tolower(substr($0,2))}')
FEATURE_NAME_PASCAL=$(echo "$FEATURE_NAME_UPPER" | sed 's/-\([a-z]\)/\U\1/g')

print_header() {
    echo -e "${BLUE}╔════════════════════════════════════════╗${NC}"
    echo -e "${BLUE}║  $1${NC}"
    echo -e "${BLUE}╚════════════════════════════════════════╝${NC}"
}

print_success() {
    echo -e "${GREEN}✓${NC} $1"
}

print_info() {
    echo -e "${CYAN}ℹ${NC} $1"
}

# ========================================
# Start
# ========================================
print_header "Generating Feature: $FEATURE_NAME_UPPER"
echo ""

BASE_PATH="src/features/$FEATURE_NAME_LOWER"

# Check if feature already exists
if [ -d "$BASE_PATH" ]; then
    echo -e "${YELLOW}Warning: Feature '$FEATURE_NAME_LOWER' already exists${NC}"
    read -p "Overwrite? (y/n) " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        exit 1
    fi
fi

# Create directories
print_info "Creating directory structure..."
mkdir -p "$BASE_PATH"/{components,hooks,services,types,utils,constants}

# ========================================
# 1. Create Types
# ========================================
print_info "Creating type definitions..."

cat > "$BASE_PATH/types/${FEATURE_NAME_LOWER}.types.ts" << EOF
/**
 * ${FEATURE_NAME_PASCAL} Types
 */

export interface ${FEATURE_NAME_PASCAL} {
  id: string;
  name: string;
  status: ${FEATURE_NAME_PASCAL}Status;
  createdAt: string;
  updatedAt: string;
}

export type ${FEATURE_NAME_PASCAL}Status = 'active' | 'inactive' | 'pending';

export interface ${FEATURE_NAME_PASCAL}FormData {
  name: string;
  description?: string;
}

export interface ${FEATURE_NAME_PASCAL}FilterParams {
  status?: ${FEATURE_NAME_PASCAL}Status;
  search?: string;
  page?: number;
  pageSize?: number;
}
EOF

cat > "$BASE_PATH/types/index.ts" << EOF
export * from './${FEATURE_NAME_LOWER}.types';
EOF

# ========================================
# 2. Create Service
# ========================================
print_info "Creating service layer..."

cat > "$BASE_PATH/services/${FEATURE_NAME_LOWER}Service.ts" << EOF
import { apiClient } from '@/services/api/client';
import type {
  ${FEATURE_NAME_PASCAL},
  ${FEATURE_NAME_PASCAL}FormData,
  ${FEATURE_NAME_PASCAL}FilterParams,
} from '../types';

export class ${FEATURE_NAME_PASCAL}Service {
  private static BASE_URL = '/${FEATURE_NAME_LOWER}';

  /**
   * Get all ${FEATURE_NAME_LOWER}
   */
  static async getAll(
    params?: ${FEATURE_NAME_PASCAL}FilterParams
  ): Promise<${FEATURE_NAME_PASCAL}[]> {
    return apiClient.get<${FEATURE_NAME_PASCAL}[]>(this.BASE_URL, { params });
  }

  /**
   * Get ${FEATURE_NAME_LOWER} by ID
   */
  static async getById(id: string): Promise<${FEATURE_NAME_PASCAL}> {
    return apiClient.get<${FEATURE_NAME_PASCAL}>(\`\${this.BASE_URL}/\${id}\`);
  }

  /**
   * Create new ${FEATURE_NAME_LOWER}
   */
  static async create(
    data: ${FEATURE_NAME_PASCAL}FormData
  ): Promise<${FEATURE_NAME_PASCAL}> {
    return apiClient.post<${FEATURE_NAME_PASCAL}>(this.BASE_URL, data);
  }

  /**
   * Update ${FEATURE_NAME_LOWER}
   */
  static async update(
    id: string,
    data: Partial<${FEATURE_NAME_PASCAL}FormData>
  ): Promise<${FEATURE_NAME_PASCAL}> {
    return apiClient.put<${FEATURE_NAME_PASCAL}>(\`\${this.BASE_URL}/\${id}\`, data);
  }

  /**
   * Delete ${FEATURE_NAME_LOWER}
   */
  static async delete(id: string): Promise<void> {
    return apiClient.delete(\`\${this.BASE_URL}/\${id}\`);
  }
}
EOF

cat > "$BASE_PATH/services/index.ts" << EOF
export * from './${FEATURE_NAME_LOWER}Service';
EOF

# ========================================
# 3. Create Hooks
# ========================================
print_info "Creating custom hooks..."

cat > "$BASE_PATH/hooks/use${FEATURE_NAME_PASCAL}.ts" << EOF
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { ${FEATURE_NAME_PASCAL}Service } from '../services';
import type {
  ${FEATURE_NAME_PASCAL},
  ${FEATURE_NAME_PASCAL}FormData,
  ${FEATURE_NAME_PASCAL}FilterParams,
} from '../types';

const QUERY_KEY = '${FEATURE_NAME_LOWER}';

/**
 * Hook to fetch all ${FEATURE_NAME_LOWER}
 */
export const use${FEATURE_NAME_PASCAL}List = (params?: ${FEATURE_NAME_PASCAL}FilterParams) => {
  return useQuery({
    queryKey: [QUERY_KEY, params],
    queryFn: () => ${FEATURE_NAME_PASCAL}Service.getAll(params),
  });
};

/**
 * Hook to fetch single ${FEATURE_NAME_LOWER}
 */
export const use${FEATURE_NAME_PASCAL} = (id: string) => {
  return useQuery({
    queryKey: [QUERY_KEY, id],
    queryFn: () => ${FEATURE_NAME_PASCAL}Service.getById(id),
    enabled: !!id,
  });
};

/**
 * Hook to create ${FEATURE_NAME_LOWER}
 */
export const useCreate${FEATURE_NAME_PASCAL} = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: ${FEATURE_NAME_PASCAL}FormData) =>
      ${FEATURE_NAME_PASCAL}Service.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEY] });
    },
  });
};

/**
 * Hook to update ${FEATURE_NAME_LOWER}
 */
export const useUpdate${FEATURE_NAME_PASCAL} = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<${FEATURE_NAME_PASCAL}FormData> }) =>
      ${FEATURE_NAME_PASCAL}Service.update(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEY] });
      queryClient.invalidateQueries({ queryKey: [QUERY_KEY, variables.id] });
    },
  });
};

/**
 * Hook to delete ${FEATURE_NAME_LOWER}
 */
export const useDelete${FEATURE_NAME_PASCAL} = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => ${FEATURE_NAME_PASCAL}Service.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEY] });
    },
  });
};
EOF

cat > "$BASE_PATH/hooks/index.ts" << EOF
export * from './use${FEATURE_NAME_PASCAL}';
EOF

# ========================================
# 4. Create Components
# ========================================
print_info "Creating components..."

# List Component
cat > "$BASE_PATH/components/${FEATURE_NAME_PASCAL}List.tsx" << EOF
import React from 'react';
import { Box, CircularProgress, Typography } from '@mui/material';
import { use${FEATURE_NAME_PASCAL}List } from '../hooks';
import { ${FEATURE_NAME_PASCAL}Card } from './${FEATURE_NAME_PASCAL}Card';

export const ${FEATURE_NAME_PASCAL}List: React.FC = () => {
  const { data, isLoading, error } = use${FEATURE_NAME_PASCAL}List();

  if (isLoading) {
    return (
      <Box display="flex" justifyContent="center" p={4}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Typography color="error">
        Error loading ${FEATURE_NAME_LOWER}: {error.message}
      </Typography>
    );
  }

  if (!data || data.length === 0) {
    return (
      <Typography color="text.secondary">
        No ${FEATURE_NAME_LOWER} found
      </Typography>
    );
  }

  return (
    <Box>
      {data.map((item) => (
        <${FEATURE_NAME_PASCAL}Card key={item.id} ${FEATURE_NAME_LOWER}={item} />
      ))}
    </Box>
  );
};
EOF

# Card Component
cat > "$BASE_PATH/components/${FEATURE_NAME_PASCAL}Card.tsx" << EOF
import React from 'react';
import { Card, CardContent, Typography, Chip } from '@mui/material';
import type { ${FEATURE_NAME_PASCAL} } from '../types';

interface ${FEATURE_NAME_PASCAL}CardProps {
  ${FEATURE_NAME_LOWER}: ${FEATURE_NAME_PASCAL};
}

export const ${FEATURE_NAME_PASCAL}Card: React.FC<${FEATURE_NAME_PASCAL}CardProps> = ({ ${FEATURE_NAME_LOWER} }) => {
  return (
    <Card sx={{ mb: 2 }}>
      <CardContent>
        <Typography variant="h6">{${FEATURE_NAME_LOWER}.name}</Typography>
        <Chip
          label={${FEATURE_NAME_LOWER}.status}
          color={${FEATURE_NAME_LOWER}.status === 'active' ? 'success' : 'default'}
          size="small"
          sx={{ mt: 1 }}
        />
      </CardContent>
    </Card>
  );
};
EOF

# Form Component
cat > "$BASE_PATH/components/${FEATURE_NAME_PASCAL}Form.tsx" << EOF
import React from 'react';
import { useForm } from 'react-hook-form';
import { Box, Button, TextField } from '@mui/material';
import { useCreate${FEATURE_NAME_PASCAL} } from '../hooks';
import type { ${FEATURE_NAME_PASCAL}FormData } from '../types';

export const ${FEATURE_NAME_PASCAL}Form: React.FC = () => {
  const { register, handleSubmit, formState: { errors } } = useForm<${FEATURE_NAME_PASCAL}FormData>();
  const { mutate: create, isPending } = useCreate${FEATURE_NAME_PASCAL}();

  const onSubmit = (data: ${FEATURE_NAME_PASCAL}FormData) => {
    create(data, {
      onSuccess: () => {
        alert('${FEATURE_NAME_PASCAL} created successfully!');
      },
    });
  };

  return (
    <Box component="form" onSubmit={handleSubmit(onSubmit)}>
      <TextField
        label="Name"
        fullWidth
        {...register('name', { required: 'Name is required' })}
        error={!!errors.name}
        helperText={errors.name?.message}
        sx={{ mb: 2 }}
      />

      <Button
        type="submit"
        variant="contained"
        disabled={isPending}
      >
        {isPending ? 'Creating...' : 'Create ${FEATURE_NAME_PASCAL}'}
      </Button>
    </Box>
  );
};
EOF

cat > "$BASE_PATH/components/index.ts" << EOF
export * from './${FEATURE_NAME_PASCAL}List';
export * from './${FEATURE_NAME_PASCAL}Card';
export * from './${FEATURE_NAME_PASCAL}Form';
EOF

# ========================================
# 5. Create Utils
# ========================================
print_info "Creating utility functions..."

cat > "$BASE_PATH/utils/${FEATURE_NAME_LOWER}Helpers.ts" << EOF
import type { ${FEATURE_NAME_PASCAL} } from '../types';

/**
 * Format ${FEATURE_NAME_LOWER} name
 */
export const format${FEATURE_NAME_PASCAL}Name = (${FEATURE_NAME_LOWER}: ${FEATURE_NAME_PASCAL}): string => {
  return ${FEATURE_NAME_LOWER}.name.toUpperCase();
};

/**
 * Check if ${FEATURE_NAME_LOWER} is active
 */
export const is${FEATURE_NAME_PASCAL}Active = (${FEATURE_NAME_LOWER}: ${FEATURE_NAME_PASCAL}): boolean => {
  return ${FEATURE_NAME_LOWER}.status === 'active';
};
EOF

cat > "$BASE_PATH/utils/index.ts" << EOF
export * from './${FEATURE_NAME_LOWER}Helpers';
EOF

# ========================================
# 6. Create Constants
# ========================================
print_info "Creating constants..."

cat > "$BASE_PATH/constants/${FEATURE_NAME_LOWER}Constants.ts" << EOF
export const ${FEATURE_NAME_UPPER}_STATUS = {
  ACTIVE: 'active',
  INACTIVE: 'inactive',
  PENDING: 'pending',
} as const;

export const ${FEATURE_NAME_UPPER}_MESSAGES = {
  CREATE_SUCCESS: '${FEATURE_NAME_PASCAL} created successfully',
  UPDATE_SUCCESS: '${FEATURE_NAME_PASCAL} updated successfully',
  DELETE_SUCCESS: '${FEATURE_NAME_PASCAL} deleted successfully',
  CREATE_ERROR: 'Failed to create ${FEATURE_NAME_LOWER}',
  UPDATE_ERROR: 'Failed to update ${FEATURE_NAME_LOWER}',
  DELETE_ERROR: 'Failed to delete ${FEATURE_NAME_LOWER}',
};
EOF

cat > "$BASE_PATH/constants/index.ts" << EOF
export * from './${FEATURE_NAME_LOWER}Constants';
EOF

# ========================================
# 7. Create Main Index
# ========================================
print_info "Creating main index file..."

cat > "$BASE_PATH/index.ts" << EOF
// Export all ${FEATURE_NAME_LOWER} module exports
export * from './components';
export * from './hooks';
export * from './services';
export * from './types';
export * from './utils';
export * from './constants';
EOF

# ========================================
# 8. Create Test Files
# ========================================
print_info "Creating test files..."

mkdir -p "tests/unit/features/${FEATURE_NAME_LOWER}"

cat > "tests/unit/features/${FEATURE_NAME_LOWER}/${FEATURE_NAME_LOWER}Service.test.ts" << EOF
import { ${FEATURE_NAME_PASCAL}Service } from '@/features/${FEATURE_NAME_LOWER}/services';

describe('${FEATURE_NAME_PASCAL}Service', () => {
  describe('getAll', () => {
    it('should fetch all ${FEATURE_NAME_LOWER}', async () => {
      // TODO: Implement test
      expect(true).toBe(true);
    });
  });

  describe('getById', () => {
    it('should fetch ${FEATURE_NAME_LOWER} by id', async () => {
      // TODO: Implement test
      expect(true).toBe(true);
    });
  });

  describe('create', () => {
    it('should create new ${FEATURE_NAME_LOWER}', async () => {
      // TODO: Implement test
      expect(true).toBe(true);
    });
  });
});
EOF

cat > "$BASE_PATH/components/${FEATURE_NAME_PASCAL}List.test.tsx" << EOF
import { render, screen } from '@testing-library/react';
import { ${FEATURE_NAME_PASCAL}List } from './${FEATURE_NAME_PASCAL}List';

describe('${FEATURE_NAME_PASCAL}List', () => {
  it('renders loading state', () => {
    render(<${FEATURE_NAME_PASCAL}List />);
    // TODO: Implement test
  });

  it('renders empty state', () => {
    // TODO: Implement test
  });

  it('renders ${FEATURE_NAME_LOWER} list', () => {
    // TODO: Implement test
  });
});
EOF

# ========================================
# Summary
# ========================================
echo ""
print_header "Feature Generated Successfully!"
echo ""
print_success "Feature '$FEATURE_NAME_UPPER' created at: $BASE_PATH"
echo ""
echo -e "${CYAN}Files created:${NC}"
echo "  • Types: ${FEATURE_NAME_LOWER}.types.ts"
echo "  • Service: ${FEATURE_NAME_LOWER}Service.ts"
echo "  • Hooks: use${FEATURE_NAME_PASCAL}.ts"
echo "  • Components: ${FEATURE_NAME_PASCAL}List, ${FEATURE_NAME_PASCAL}Card, ${FEATURE_NAME_PASCAL}Form"
echo "  • Utils: ${FEATURE_NAME_LOWER}Helpers.ts"
echo "  • Constants: ${FEATURE_NAME_LOWER}Constants.ts"
echo "  • Tests: Service and Component tests"
echo ""
echo -e "${CYAN}Next steps:${NC}"
echo "  1. Customize types in types/${FEATURE_NAME_LOWER}.types.ts"
echo "  2. Implement business logic in services/"
echo "  3. Update components in components/"
echo "  4. Add feature to routing"
echo ""
print_info "Happy coding! 🚀"
echo ""
