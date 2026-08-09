// Vercel Serverless Function
// Keeps the Anthropic API key on the server side (never sent to the browser)

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }

  const { base64, mediaType } = req.body || {};
  if (!base64 || !mediaType) {
    res.status(400).json({ error: 'base64와 mediaType이 필요해요.' });
    return;
  }

  if (!process.env.ANTHROPIC_API_KEY) {
    res.status(500).json({ error: 'ANTHROPIC_API_KEY 환경변수가 설정되지 않았어요.' });
    return;
  }

  try {
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': process.env.ANTHROPIC_API_KEY,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: 'claude-sonnet-4-6',
        max_tokens: 1500,
        system:
          "카카오톡 작업 주문 메시지 스크린샷에서 정보를 추출해. 한 메시지 안에 서로 다른 고객의 주문이 여러 건 섞여 있을 수 있으니, 이름/주소/연락처가 바뀌는 지점을 기준으로 주문 단위를 정확히 구분해. 절대 서로 다른 주문의 필드(예: A 고객 이름 + B 고객 주소)를 섞지 마. 결과는 주문 개수만큼의 객체를 담은 JSON 배열로만 반환해 (주문이 1건이어도 배열에 객체 1개). 설명, 코드블록, 다른 텍스트 없이 순수 JSON 배열만. 각 객체 필드: customerName(고객명, 문자열), phone(연락처, 문자열), address(주소 전체, 문자열), item(제품 또는 시술명, 문자열), price(금액, 숫자만 정수 원단위, 콤마/원 제외, 모르면 null), referrer(소개자 이름, 없으면 null), memo(방문 가능 시간대나 요청사항 등 그 외 특이사항, 없으면 null).",
        messages: [
          {
            role: 'user',
            content: [
              { type: 'image', source: { type: 'base64', media_type: mediaType, data: base64 } },
              { type: 'text', text: '이 스크린샷에서 주문 정보를 JSON 배열로 추출해줘. 주문이 여러 건이면 각각 분리해줘.' },
            ],
          },
        ],
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      res.status(response.status).json({ error: data?.error?.message || 'Anthropic API 오류' });
      return;
    }

    const textBlock = (data.content || []).find((b) => b.type === 'text');
    if (!textBlock) {
      res.status(500).json({ error: '분석 결과를 받지 못했어요.' });
      return;
    }

    const clean = textBlock.text.replace(/```json|```/g, '').trim();
    let parsed = JSON.parse(clean);
    if (!Array.isArray(parsed)) parsed = [parsed];
    res.status(200).json(parsed);
  } catch (e) {
    res.status(500).json({ error: e.message || '알 수 없는 오류' });
  }
}
