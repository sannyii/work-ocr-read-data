// 豆包多模态模型 API 客户端

export interface Article {
  title: string;
  reads: number;
  likes: number;
  shares?: number;
}

export interface BrandData {
  brand: string;
  articles: Article[];
}

export interface OCRResult {
  success: boolean;
  data?: BrandData;
  error?: string;
}

const SYSTEM_PROMPT = `你是一个专业的图片数据提取助手。请分析微信公众号文章列表截图，提取以下信息：

1. 品牌名称：图片左上角的公众号名称
2. 所有文章的：标题、阅读数、点赞数、转发数（如果有的话）

注意事项：
- 阅读数格式可能是 "阅读3.0万" 或 "阅读7240"，请转换为数字（3.0万 = 30000）
- 点赞数格式可能是 "赞86" 或 "赞3"
- 转发数可能不存在

请严格按照以下 JSON 格式返回，不要包含其他任何文字：

{
  "brand": "公众号名称",
  "articles": [
    {
      "title": "文章标题",
      "reads": 7240,
      "likes": 86,
      "shares": 1
    }
  ]
}`;

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
                text: `${SYSTEM_PROMPT}\n\n请分析这张微信公众号文章列表截图，提取品牌名称和所有文章数据。`
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

      const data = JSON.parse(jsonStr.trim()) as BrandData;
      return {
        success: true,
        data
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
