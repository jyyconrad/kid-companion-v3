import React from 'react';
import { View, Text, Image, StyleSheet, Linking, TouchableOpacity, ScrollView } from 'react-native';
import Markdown, { MarkdownIt, renderRules } from 'react-native-markdown-display';

// 图片结果接口
export interface ImageResult {
  url: string;
  thumbnail: string;
  title: string;
  source: string;
  width?: number;
  height?: number;
}

interface MarkdownRendererProps {
  content: string;
  images?: ImageResult[];
  onLinkPress?: (url: string) => void;
  onImagePress?: (image: ImageResult) => void;
}

/**
 * 增强 Markdown 渲染组件
 * 支持：标题、列表、代码块、表格、图片、链接
 */
export const MarkdownRenderer: React.FC<MarkdownRendererProps> = ({
  content,
  images,
  onLinkPress,
  onImagePress,
}) => {
  // 自定义规则
  const rules = {
    // 图片渲染
    image: (node: any) => {
      const src = node.attributes?.src || '';
      if (!src) return null;
      
      return (
        <TouchableOpacity 
          key={node.key} 
          onPress={() => {
            const img = images?.find(i => i.url === src || i.thumbnail === src);
            if (img && onImagePress) {
              onImagePress(img);
            }
          }}
        >
          <Image
            source={{ uri: src }}
            style={styles.image}
            resizeMode="contain"
          />
        </TouchableOpacity>
      );
    },
    // 链接渲染
    link: (node: any, children: any, parent: any, styles: any) => {
      const href = node.attributes?.href || '';
      return (
        <Text
          key={node.key}
          style={markdownStyles.link}
          onPress={() => {
            if (onLinkPress) {
              onLinkPress(href);
            } else {
              Linking.openURL(href).catch(() => {});
            }
          }}
        >
          {children}
        </Text>
      );
    },
    // 代码块渲染
    code_block: (node: any) => (
      <ScrollView 
        key={node.key} 
        horizontal 
        style={styles.codeBlock}
        contentContainerStyle={styles.codeBlockContent}
      >
        <Text style={markdownStyles.code_block}>{node.content}</Text>
      </ScrollView>
    ),
    // 表格渲染（简化版）
    table: (node: any, children: any) => (
      <ScrollView key={node.key} horizontal style={styles.table}>
        <View style={styles.tableContent}>{children}</View>
      </ScrollView>
    ),
  };

  return (
    <View style={styles.container}>
      <Markdown style={markdownStyles} rules={rules}>
        {content}
      </Markdown>
      
      {/* 搜索结果图片 */}
      {images && images.length > 0 && (
        <View style={styles.imagesContainer}>
          {images.map((img, index) => (
            <TouchableOpacity
              key={index}
              onPress={() => onImagePress?.(img)}
              style={styles.imageWrapper}
            >
              <Image
                source={{ uri: img.thumbnail || img.url }}
                style={styles.searchImage}
                resizeMode="cover"
              />
              {img.title && (
                <Text style={styles.imageCaption} numberOfLines={1}>
                  {img.title}
                </Text>
              )}
            </TouchableOpacity>
          ))}
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  image: {
    width: '100%',
    height: 200,
    borderRadius: 8,
    marginVertical: 8,
  },
  codeBlock: {
    backgroundColor: '#f5f5f5',
    borderRadius: 8,
    marginVertical: 8,
  },
  codeBlockContent: {
    padding: 12,
  },
  table: {
    marginVertical: 8,
  },
  tableContent: {
    minWidth: '100%',
  },
  imagesContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 8,
  },
  imageWrapper: {
    marginRight: 8,
    marginBottom: 8,
    width: 100,
  },
  searchImage: {
    width: 100,
    height: 75,
    borderRadius: 8,
    backgroundColor: '#f0f0f0',
  },
  imageCaption: {
    fontSize: 10,
    color: '#666',
    marginTop: 4,
  },
});

const markdownStyles = StyleSheet.create({
  body: {
    color: '#000',
    fontSize: 16,
    lineHeight: 24,
  },
  heading1: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 12,
    color: '#1a1a1a',
  },
  heading2: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 10,
    color: '#333',
  },
  heading3: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 8,
    color: '#444',
  },
  heading4: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 6,
    color: '#555',
  },
  heading5: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 4,
    color: '#666',
  },
  heading6: {
    fontSize: 14,
    fontWeight: 'bold',
    marginBottom: 4,
    color: '#777',
  },
  paragraph: {
    marginBottom: 8,
  },
  strong: {
    fontWeight: 'bold',
  },
  em: {
    fontStyle: 'italic',
  },
  s: {
    textDecorationLine: 'line-through',
  },
  link: {
    color: '#007AFF',
    textDecorationLine: 'underline',
  },
  code_inline: {
    backgroundColor: '#f5f5f5',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    fontSize: 14,
    fontFamily: 'monospace',
  },
  code_block: {
    fontFamily: 'monospace',
    fontSize: 13,
    color: '#333',
  },
  fence: {
    backgroundColor: '#f5f5f5',
    borderRadius: 8,
    padding: 12,
  },
  blockquote: {
    borderLeftWidth: 4,
    borderLeftColor: '#007AFF',
    paddingLeft: 12,
    marginVertical: 8,
    backgroundColor: '#f9f9f9',
    paddingVertical: 8,
  },
  bullet_list: {
    marginVertical: 4,
  },
  ordered_list: {
    marginVertical: 4,
  },
  list_item: {
    flexDirection: 'row',
    marginBottom: 4,
  },
  bullet_list_icon: {
    marginRight: 8,
    fontSize: 16,
  },
  ordered_list_icon: {
    marginRight: 8,
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default MarkdownRenderer;