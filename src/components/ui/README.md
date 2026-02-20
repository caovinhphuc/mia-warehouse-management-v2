# 🎨 UI Component Library

Modern, accessible, and reusable UI components for MIA Warehouse Management System.

## 📦 Components

### 1. **Skeleton** - Loading Placeholders

Beautiful loading skeletons for better UX while data loads.

```jsx
import { Skeleton } from '@/components/ui';

// Basic text skeleton
<Skeleton />

// Multiple lines
<Skeleton count={3} />

// Avatar
<Skeleton.Avatar size={48} />

// Button
<Skeleton.Button width={100} height={40} />

// Input
<Skeleton.Input />

// Custom width/height
<Skeleton width={200} height={100} variant="rect" />

// Circle (for avatars)
<Skeleton circle width={60} height={60} />

// With animation
<Skeleton animation="wave" /> // default
<Skeleton animation="pulse" />
<Skeleton animation="none" />
```

### 2. **Toast** - Notifications

Modern toast notification system with multiple variants.

```jsx
import { useToast } from "@/components/ui";

function MyComponent() {
  const toast = useToast();

  const handleSuccess = () => {
    toast.success("Operation completed successfully!");
  };

  const handleError = () => {
    toast.error("Something went wrong!", {
      duration: 5000, // 5 seconds
    });
  };

  const handleInfo = () => {
    toast.info("New information available", {
      action: {
        label: "View",
        onClick: () => console.log("Action clicked"),
      },
    });
  };

  const handleWarning = () => {
    toast.warning("Please review your changes");
  };

  const handleCustom = () => {
    toast.show("Custom message", {
      type: "info",
      duration: 4000,
      icon: "🎉",
      closable: true,
    });
  };

  return (
    <div>
      <button onClick={handleSuccess}>Success Toast</button>
      <button onClick={handleError}>Error Toast</button>
      <button onClick={handleInfo}>Info Toast</button>
      <button onClick={handleWarning}>Warning Toast</button>
    </div>
  );
}
```

**Toast Options:**

- `type`: 'success' | 'error' | 'info' | 'warning'
- `duration`: number (ms) - 0 for no auto-dismiss
- `icon`: custom icon element
- `action`: { label, onClick } - action button
- `closable`: boolean - show close button

### 3. **Button** - Custom Buttons

Enhanced button component with multiple variants and states.

```jsx
import { Button } from '@/components/ui';

// Variants
<Button variant="primary">Primary</Button>
<Button variant="secondary">Secondary</Button>
<Button variant="success">Success</Button>
<Button variant="danger">Danger</Button>
<Button variant="ghost">Ghost</Button>
<Button variant="link">Link</Button>

// Sizes
<Button size="sm">Small</Button>
<Button size="md">Medium</Button>
<Button size="lg">Large</Button>

// With icon
<Button icon={<IconComponent />}>With Icon</Button>
<Button icon={<IconComponent />} iconPosition="right">Icon Right</Button>

// Icon only
<Button icon={<IconComponent />} />

// States
<Button loading>Loading...</Button>
<Button disabled>Disabled</Button>

// Full width
<Button fullWidth>Full Width Button</Button>

// Custom styling
<Button className="custom-class" onClick={handleClick}>
  Click Me
</Button>
```

### 4. **Card** - Container Cards

Flexible card component with multiple variants and states.

```jsx
import { Card } from '@/components/ui';

// Basic card
<Card>
  <h3>Card Title</h3>
  <p>Card content goes here</p>
</Card>

// With header and body
<Card>
  <Card.Header>
    <h3>Card Title</h3>
  </Card.Header>
  <Card.Body>
    <p>Card content</p>
  </Card.Body>
  <Card.Footer>
    <button>Action</button>
  </Card.Footer>
</Card>

// Variants
<Card variant="default">Default Card</Card>
<Card variant="outlined">Outlined Card</Card>
<Card variant="elevated">Elevated Card</Card>

// Interactive
<Card hoverable>Hoverable Card</Card>
<Card onClick={handleClick} hoverable>Clickable Card</Card>

// Shadow levels
<Card shadow="none">No Shadow</Card>
<Card shadow="sm">Small Shadow</Card>
<Card shadow="md">Medium Shadow</Card>
<Card shadow="lg">Large Shadow</Card>

// Padding
<Card padding="sm">Small Padding</Card>
<Card padding="md">Medium Padding</Card>
<Card padding="lg">Large Padding</Card>

// Loading state
<Card loading>
  {/* Content will be replaced with skeleton */}
</Card>

// No border
<Card bordered={false}>No Border</Card>
```

### 5. **Empty** - Empty States

Beautiful empty state component for "no data" scenarios.

```jsx
import { Empty } from '@/components/ui';

// Basic empty state
<Empty />

// With custom title and description
<Empty
  title="No items found"
  description="Start by adding your first item"
/>

// Variants
<Empty variant="default" />
<Empty variant="search" title="No results" description="Try different keywords" />
<Empty variant="error" title="Error" description="Failed to load data" />
<Empty variant="success" title="All done!" description="You've completed everything" />

// With custom image
<Empty
  image={<img src="/custom-empty.svg" />}
  title="Custom Empty State"
/>

// With action button
<Empty
  title="No products"
  description="Get started by adding your first product"
  action={
    <button onClick={handleAddProduct}>
      Add Product
    </button>
  }
/>
```

### 6. **Loading** - Loading Indicators

Elegant loading spinners and indicators.

```jsx
import { Loading } from '@/components/ui';

// Basic spinner
<Loading />

// With text
<Loading text="Loading..." />

// Sizes
<Loading size="sm" />
<Loading size="md" />
<Loading size="lg" />

// Variants
<Loading variant="spinner" />
<Loading variant="dots" />
<Loading variant="bars" />
<Loading variant="pulse" />

// Full screen overlay
<Loading fullScreen text="Processing..." />

// Custom color
<Loading color="primary" />
<Loading color="secondary" />
```

## 🎨 Usage Examples

### Dashboard with Skeleton Loading

```jsx
import { Skeleton, Card } from "@/components/ui";

function Dashboard() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData().then((data) => {
      setData(data);
      setLoading(false);
    });
  }, []);

  if (loading) {
    return (
      <div className="dashboard">
        <Card>
          <Skeleton.Avatar size={60} />
          <Skeleton count={3} />
        </Card>
        <Card>
          <Skeleton height={200} />
          <Skeleton count={2} />
        </Card>
      </div>
    );
  }

  return <div className="dashboard">{/* Actual content */}</div>;
}
```

### Form with Toast Notifications

```jsx
import { useToast, Button } from "@/components/ui";

function UserForm() {
  const toast = useToast();

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      await saveUser(formData);
      toast.success("User saved successfully!");
    } catch (error) {
      toast.error("Failed to save user", {
        action: {
          label: "Retry",
          onClick: () => handleSubmit(e),
        },
      });
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      {/* Form fields */}
      <Button type="submit" variant="primary">
        Save User
      </Button>
    </form>
  );
}
```

### List with Empty State

```jsx
import { Empty, Card } from "@/components/ui";

function ProductList({ products }) {
  if (products.length === 0) {
    return (
      <Card>
        <Empty
          variant="default"
          title="No products found"
          description="Start by adding your first product to the inventory"
          action={<Button onClick={handleAddProduct}>Add Product</Button>}
        />
      </Card>
    );
  }

  return (
    <div className="product-list">
      {products.map((product) => (
        <ProductCard key={product.id} product={product} />
      ))}
    </div>
  );
}
```

## 🎯 Best Practices

### 1. Use Skeleton for Loading States

```jsx
// ❌ Bad
{
  loading && <div>Loading...</div>;
}

// ✅ Good
{
  loading ? <Skeleton count={3} /> : <ContentList data={data} />;
}
```

### 2. Use Toast for User Feedback

```jsx
// ❌ Bad
alert("Success!");

// ✅ Good
toast.success("Operation completed successfully!");
```

### 3. Use Empty for No Data

```jsx
// ❌ Bad
{
  data.length === 0 && <div>No data</div>;
}

// ✅ Good
{
  data.length === 0 && <Empty title="No data available" />;
}
```

### 4. Use Custom Button for Consistency

```jsx
// ❌ Bad - Direct Ant Design usage everywhere
<AntdButton type="primary">Submit</AntdButton>

// ✅ Good - Use custom Button for simple cases
<Button variant="primary">Submit</Button>

// ℹ️ Still OK to use Ant Design for complex components
<AntdTable columns={columns} dataSource={data} />
```

## 🚀 Integration Status

- ✅ **ToastProvider** added to App.jsx
- ✅ All 6 components copied from React-OAS-Integration-v4.0
- ✅ Index file created for easy imports
- ⏳ Gradually replacing existing patterns in components

## 📝 Migration Checklist

- [ ] Update Dashboard components to use Skeleton
- [ ] Replace message.success/error with Toast
- [ ] Add Empty states to lists and search results
- [ ] Use Custom Button in new components
- [ ] Add Card wrapper to dashboard widgets
- [ ] Replace Loading spinner with new Loading component

## 🎨 Customization

All components use CSS custom properties (CSS variables) for easy theming:

```css
/* Override in your global.css or component CSS */
:root {
  --color-primary: #1890ff;
  --color-success: #52c41a;
  --color-error: #ff4d4f;
  --color-warning: #faad14;
  --color-info: #1890ff;

  --color-gray-100: #f5f5f5;
  --color-gray-300: #d9d9d9;
  --color-gray-400: #bfbfbf;
  --color-gray-500: #8c8c8c;
}
```

## 📚 Further Reading

- [React Best Practices](https://react.dev/learn)
- [Accessibility Guidelines](https://www.w3.org/WAI/WCAG21/quickref/)
- [Component Design Patterns](https://www.patterns.dev/)

---

**Ready to use!** 🚀 Import from `@/components/ui` and start building better UX!
