export type Template = { name: string; content: string };

export const TEMPLATES: Template[] = [
  {
    name: "Oyun Entegrasyonu",
    content: `---
title: Game Integration Guide
game: Your Game Name
version: 1.0.0
provider: Provider Name
date: 2026-01-01
---

## Overview

Short description of the game and what this document covers.

## Game Launch

\`\`\`http
GET /launch?gameId=GAME_ID&token=PLAYER_TOKEN&lang=en
\`\`\`

| Parameter | Type   | Required | Description        |
|-----------|--------|----------|--------------------|
| gameId    | string | yes      | Unique game ID     |
| token     | string | yes      | Player session     |
| lang      | string | no       | Language code      |

## Wallet Callbacks

### Bet

\`\`\`json
{
  "playerId": "p_123",
  "roundId": "r_456",
  "amount": 1.0,
  "currency": "USD"
}
\`\`\`

### Win

\`\`\`json
{
  "playerId": "p_123",
  "roundId": "r_456",
  "amount": 5.0,
  "currency": "USD"
}
\`\`\`

## Error Codes

| Code | Meaning              |
|------|----------------------|
| 1001 | Invalid token        |
| 1002 | Insufficient balance |
`,
  },
  {
    name: "Boş",
    content: `---
title: Untitled
version: 1.0.0
---

## Başlık

Buraya yazmaya başla.
`,
  },
];

// Araç çubuğundaki "Hazır parça" menüsü
export const SNIPPETS: { name: string; content: string }[] = [
  {
    name: "API isteği (endpoint)",
    content: "### Endpoint Adı\n\n```http\nPOST /api/v1/endpoint\nContent-Type: application/json\n```",
  },
  {
    name: "Parametre tablosu",
    content:
      "| Parametre | Tip    | Zorunlu | Açıklama       |\n|-----------|--------|---------|----------------|\n| playerId  | string | evet    | Oyuncu kimliği |",
  },
  {
    name: "JSON istek / yanıt",
    content:
      '**Request**\n\n```json\n{\n  "key": "value"\n}\n```\n\n**Response**\n\n```json\n{\n  "status": "ok"\n}\n```',
  },
  {
    name: "Hata kodları tablosu",
    content:
      "| Kod  | Anlam                |\n|------|----------------------|\n| 1001 | Geçersiz token       |\n| 1002 | Yetersiz bakiye      |",
  },
  { name: "Uyarı kutusu", content: "> **Uyarı:** Buraya önemli uyarıyı yaz." },
];
