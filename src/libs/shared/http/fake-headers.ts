/* eslint-disable @typescript-eslint/naming-convention */
export const createFakeHeaders = ({
  origin,
  referer,
  host,
}: {
  origin: string
  referer?: string
  host?: string
}) => ({
  Accept: '*/*',
  'Accept-Encoding': 'gzip, deflate, br',
  'Accept-Language': 'ru,en-US;q=0.9,en;q=0.8',
  Connection: 'keep-alive',
  Host: host ?? '',
  Origin: origin,
  Referer: referer ?? origin,
  'sec-ch-ua':
    '".Not/A)Brand";v="99", "Google Chrome";v="103", "Chromium";v="103"',
  'sec-ch-ua-mobile': '?0',
  'sec-ch-ua-platform': '"macOS"',
  'Sec-Fetch-Dest': 'empty',
  'Sec-Fetch-Mode': 'cors',
  'Sec-Fetch-Site': 'cross-site',
  'User-Agent':
    'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/103.0.0.0 Safari/537.36',
})
