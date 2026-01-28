// 豆包多模态模型 API 客户端

export interface Article {
  title: string;
  reads: number;
  likes: number;
  positionLabel?: string;
}

export interface CardData {
  brand: string;
  date: string;
  articles: Article[];
  sourceLabel?: string; // e.g. "Little Green Book 1"
  headlineRank?: number; // e.g. 1 for Headline 1
}

export interface BrandGroup {
  brand: string;
  cards: CardData[];
}

export interface OCRResult {
  success: boolean;
  data?: CardData[];
  error?: string;
}

const SYSTEM_PROMPT = `你是一个专业的图片数据提取助手。请分析微信公众号文章列表截图，这是一个包含多个推送卡片（Card）的列表。请识别每个卡片的信息，提取以下内容：

1. 品牌名称：卡片顶部的公众号名称（如“量子位”、“新智元”）。
2. 推送时间/日期：每个卡片上显示的日期时间（如“昨天”、“5分钟前”、“2023年10月20日”）。如果找不到具体日期，请根据上下文推断或标记为“未知日期”。
3. 文章列表：该卡片下包含的所有文章。

对于每个文章，提取：
- 标题
- 阅读数：请转换为数字（如 "3.0万" -> 30000）
- 点赞数：请转换为数字

请严格按照以下 JSON 格式返回 List，不要包含其他任何文字：

[
  {
    "brand": "公众号名称",
    "date": "昨天",
    "articles": [
      {
        "title": "文章标题",
        "reads": 7240,
        "likes": 86
      }
    ]
  }
]`;

export async function analyzeImage(base64Image: string): Promise<OCRResult> {
  const apiKey = process.env.DOUBAO_API_KEY;
  const model = process.env.DOUBAO_MODEL || 'doubao-1.5-vision-lite';
  const baseUrl = process.env.DOUBAO_BASE_URL || 'https://ark.cn-beijing.volces.com/api/v3';

  if (!apiKey) {
    return {
      success: false,
      error: '未配置 DOUBAO_API_KEY 环境变量'
    };
  }

  try {
    const response = await fetch(`${baseUrl}/chat/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model: model,
        max_completion_tokens: 8192,
        messages: [
          {
            role: 'user',
            content: [
              {
                type: 'image_url',
                image_url: {
                  url: base64Image.startsWith('data:')
                    ? base64Image
                    : `data:image/png;base64,${base64Image}`
                }
              },
              {
                type: 'text',
                text: `${SYSTEM_PROMPT}\n\n请分析这张截图，将每个推送块作为一个独立的Object。请注意，一张图可能包含多个不同日期的推送。`
              }
            ]
          }
        ]
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Doubao API error:', errorText);
      return {
        success: false,
        error: `API 请求失败: ${response.status} - ${errorText}`
      };
    }

    const result = await response.json();
    const content = result.choices?.[0]?.message?.content;

    if (!content) {
      return {
        success: false,
        error: '未获取到模型响应'
      };
    }

    // 尝试解析 JSON
    try {
      // 提取 JSON 内容（处理可能的 markdown 代码块）
      let jsonStr = content;
      const jsonMatch = content.match(/```(?:json)?\s*([\s\S]*?)```/);
      if (jsonMatch) {
        jsonStr = jsonMatch[1];
      }

      // 尝试解析为数组
      let data = JSON.parse(jsonStr.trim());

      // 兼容可能返回单个对象的情况
      if (!Array.isArray(data)) {
        data = [data];
      }

      return {
        success: true,
        data: data as CardData[]
      };
    } catch (parseError) {
      console.error('JSON parse error:', parseError, 'Content:', content);
      return {
        success: false,
        error: `解析响应失败: ${content.substring(0, 200)}`
      };
    }
  } catch (error) {
    console.error('Request error:', error);
    return {
      success: false,
      error: `请求异常: ${error instanceof Error ? error.message : '未知错误'}`
    };
  }
}
