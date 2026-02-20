/* eslint-disable */
/**
 * Smart Search Component
 * Smart search across all data with NLP capabilities
 */

import React, { useState, useEffect } from "react";
import {
  Card,
  Input,
  List,
  Typography,
  Tag,
  Space,
  Button,
  Empty,
  Spin,
} from "antd";
import {
  SearchOutlined,
  ClearOutlined,
  FilterOutlined,
} from "@ant-design/icons";
import { smartAutomationService } from "../../services/smartAutomationService";
import "./SmartSearch.css";

const { Title, Text } = Typography;

const SmartSearch = ({ data = [], columns = null, onResultSelect = null }) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchStats, setSearchStats] = useState({
    total: 0,
    matched: 0,
    time: 0,
  });

  useEffect(() => {
    // Auto-search when query changes (debounced)
    const timer = setTimeout(() => {
      if (searchQuery.trim()) {
        performSearch(searchQuery.trim());
      } else {
        setResults([]);
        setSearchStats({ total: 0, matched: 0, time: 0 });
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  const performSearch = async (query) => {
    if (!data || data.length === 0) {
      setResults([]);
      return;
    }

    setLoading(true);
    const startTime = Date.now();

    try {
      // Use smartAutomationService for advanced search
      // For now, implement simple smart search
      const searchResults = smartSearch(query, data, columns);

      const endTime = Date.now();
      setResults(searchResults);
      setSearchStats({
        total: data.length,
        matched: searchResults.length,
        time: endTime - startTime,
      });
    } catch (error) {
      console.error("Search error:", error);
      setResults([]);
    } finally {
      setLoading(false);
    }
  };

  const smartSearch = (query, data, columns = null) => {
    if (!data || data.length === 0) return [];

    const queryLower = query.toLowerCase();
    const queryWords = queryLower.split(/\s+/).filter((w) => w.length > 1);

    // Search columns
    const searchColumns = columns || (data[0] ? Object.keys(data[0]) : []);

    // Score-based search
    const scoredResults = data.map((row, index) => {
      let score = 0;
      let matchedFields = [];

      for (const col of searchColumns) {
        if (!row[col]) continue;

        const value = String(row[col]).toLowerCase();

        // Exact match
        if (value.includes(queryLower)) {
          score += 10;
          matchedFields.push(col);
        }

        // Word matches
        for (const word of queryWords) {
          if (value.includes(word)) {
            score += 1;
            if (!matchedFields.includes(col)) {
              matchedFields.push(col);
            }
          }
        }
      }

      return { row, score, index, matchedFields };
    });

    // Filter and sort
    const filtered = scoredResults
      .filter((item) => item.score > 0)
      .sort((a, b) => b.score - a.score)
      .slice(0, 50); // Top 50 results

    return filtered.map((item) => ({
      ...item.row,
      _score: item.score,
      _matchedFields: item.matchedFields,
    }));
  };

  const handleClear = () => {
    setSearchQuery("");
    setResults([]);
    setSearchStats({ total: 0, matched: 0, time: 0 });
  };

  const handleResultClick = (result) => {
    if (onResultSelect) {
      onResultSelect(result);
    }
  };

  return (
    <Card className="smart-search">
      <Title level={4}>
        <SearchOutlined /> Smart Search
      </Title>

      <Input
        placeholder='Tìm kiếm thông minh... (VD: "sales", "2024", "high value")'
        prefix={<SearchOutlined />}
        suffix={
          searchQuery && (
            <Button
              type="text"
              size="small"
              icon={<ClearOutlined />}
              onClick={handleClear}
            />
          )
        }
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
        size="large"
        style={{ marginBottom: 16 }}
      />

      {searchStats.total > 0 && (
        <div className="search-stats">
          <Space>
            <Text type="secondary">
              Tìm thấy {searchStats.matched} / {searchStats.total} kết quả
            </Text>
            <Tag>{searchStats.time}ms</Tag>
          </Space>
        </div>
      )}

      {loading ? (
        <div style={{ textAlign: "center", padding: 40 }}>
          <Spin /> <Text type="secondary">Đang tìm kiếm...</Text>
        </div>
      ) : results.length === 0 && searchQuery ? (
        <Empty
          description="Không tìm thấy kết quả"
          image={Empty.PRESENTED_IMAGE_SIMPLE}
        />
      ) : (
        <List
          dataSource={results}
          renderItem={(item, index) => (
            <List.Item
              className="search-result-item"
              onClick={() => handleResultClick(item)}
            >
              <Space direction="vertical" style={{ width: "100%" }}>
                <div className="result-content">
                  {Object.entries(item)
                    .filter(([key]) => !key.startsWith("_"))
                    .slice(0, 5)
                    .map(([key, value]) => (
                      <div key={key} className="result-field">
                        <Text strong>{key}:</Text> <Text>{String(value)}</Text>
                      </div>
                    ))}
                </div>
                {item._matchedFields && item._matchedFields.length > 0 && (
                  <Space wrap>
                    {item._matchedFields.map((field) => (
                      <Tag key={field} color="blue">
                        {field}
                      </Tag>
                    ))}
                    <Tag color="green">Score: {item._score}</Tag>
                  </Space>
                )}
              </Space>
            </List.Item>
          )}
          pagination={{
            pageSize: 10,
            showSizeChanger: false,
          }}
        />
      )}
    </Card>
  );
};

export default SmartSearch;
