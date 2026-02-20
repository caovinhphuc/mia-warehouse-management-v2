/**
 * UI Components Demo
 * Showcase of the new UI component library
 */

import React, { useState } from "react";
import { Skeleton, Button, Card, Empty, Loading, useToast } from "../ui";
import "./UIDemo.css";

const UIDemo = () => {
  const [loading, setLoading] = useState(false);
  const [showEmpty, setShowEmpty] = useState(false);
  const toast = useToast();

  const handleLoadingDemo = () => {
    setLoading(true);
    setTimeout(() => setLoading(false), 3000);
  };

  return (
    <div className="ui-demo">
      <h1>🎨 UI Component Library Demo</h1>

      {/* Toast Notifications Demo */}
      <Card className="demo-section">
        <Card.Header>
          <h2>Toast Notifications</h2>
        </Card.Header>
        <Card.Body>
          <div className="button-group">
            <Button
              variant="success"
              onClick={() => toast.success("Operation successful!")}
            >
              Success Toast
            </Button>
            <Button
              variant="danger"
              onClick={() => toast.error("Something went wrong!")}
            >
              Error Toast
            </Button>
            <Button
              variant="primary"
              onClick={() => toast.info("New information available")}
            >
              Info Toast
            </Button>
            <Button
              variant="secondary"
              onClick={() => toast.warning("Please review your changes")}
            >
              Warning Toast
            </Button>
          </div>
        </Card.Body>
      </Card>

      {/* Skeleton Loading Demo */}
      <Card className="demo-section">
        <Card.Header>
          <h2>Skeleton Loading</h2>
        </Card.Header>
        <Card.Body>
          <Button onClick={handleLoadingDemo} disabled={loading}>
            {loading ? "Loading..." : "Trigger Loading State"}
          </Button>

          <div className="skeleton-demo">
            {loading ? (
              <>
                <Skeleton.Avatar size={60} />
                <Skeleton count={3} />
                <Skeleton width="80%" height={100} />
              </>
            ) : (
              <>
                <div className="profile">
                  <div className="avatar">👤</div>
                  <div>
                    <h3>John Doe</h3>
                    <p>Software Engineer</p>
                    <p>john.doe@example.com</p>
                  </div>
                </div>
                <div className="content-block">
                  <p>This is the actual content that appears after loading.</p>
                </div>
              </>
            )}
          </div>
        </Card.Body>
      </Card>

      {/* Button Variants Demo */}
      <Card className="demo-section">
        <Card.Header>
          <h2>Button Variants</h2>
        </Card.Header>
        <Card.Body>
          <div className="button-showcase">
            <div className="button-row">
              <Button variant="primary">Primary</Button>
              <Button variant="secondary">Secondary</Button>
              <Button variant="success">Success</Button>
              <Button variant="danger">Danger</Button>
              <Button variant="ghost">Ghost</Button>
            </div>
            <div className="button-row">
              <Button size="sm">Small</Button>
              <Button size="md">Medium</Button>
              <Button size="lg">Large</Button>
            </div>
            <div className="button-row">
              <Button loading>Loading</Button>
              <Button disabled>Disabled</Button>
            </div>
          </div>
        </Card.Body>
      </Card>

      {/* Card Variants Demo */}
      <Card className="demo-section">
        <Card.Header>
          <h2>Card Variants</h2>
        </Card.Header>
        <Card.Body>
          <div className="card-showcase">
            <Card shadow="sm" padding="sm">
              <h4>Small Card</h4>
              <p>Small shadow and padding</p>
            </Card>
            <Card shadow="md" padding="md">
              <h4>Medium Card</h4>
              <p>Medium shadow and padding</p>
            </Card>
            <Card shadow="lg" padding="lg" hoverable>
              <h4>Large Card</h4>
              <p>Large shadow, padding, and hoverable</p>
            </Card>
          </div>
        </Card.Body>
      </Card>

      {/* Empty State Demo */}
      <Card className="demo-section">
        <Card.Header>
          <h2>Empty States</h2>
        </Card.Header>
        <Card.Body>
          <Button onClick={() => setShowEmpty(!showEmpty)}>
            Toggle Empty State
          </Button>

          <div className="empty-demo">
            {showEmpty ? (
              <Empty
                variant="search"
                title="No results found"
                description="Try different search terms or filters"
                action={
                  <Button onClick={() => setShowEmpty(false)}>
                    Clear Search
                  </Button>
                }
              />
            ) : (
              <div className="content-list">
                <div className="list-item">Item 1</div>
                <div className="list-item">Item 2</div>
                <div className="list-item">Item 3</div>
              </div>
            )}
          </div>
        </Card.Body>
      </Card>

      {/* Loading Indicators Demo */}
      <Card className="demo-section">
        <Card.Header>
          <h2>Loading Indicators</h2>
        </Card.Header>
        <Card.Body>
          <div className="loading-showcase">
            <div className="loading-item">
              <Loading variant="spinner" />
              <p>Spinner</p>
            </div>
            <div className="loading-item">
              <Loading variant="dots" />
              <p>Dots</p>
            </div>
            <div className="loading-item">
              <Loading variant="bars" />
              <p>Bars</p>
            </div>
            <div className="loading-item">
              <Loading variant="pulse" />
              <p>Pulse</p>
            </div>
          </div>
        </Card.Body>
      </Card>
    </div>
  );
};

export default UIDemo;
