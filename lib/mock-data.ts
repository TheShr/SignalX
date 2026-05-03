export interface FeedItem {
  id: string
  title: string
  description: string
  impact: 'HIGH' | 'MEDIUM' | 'LOW'
  timestamp: Date
  source: string
}

export interface AIInsight {
  id: string
  title: string
  impact: string
  explanation: string
  suggestedAction: string
  confidence: number
}

export interface Alert {
  id: string
  title: string
  message: string
  priority: 'CRITICAL' | 'WARNING' | 'INFO'
  timestamp: Date
  resolved: boolean
}

export const mockInsights: AIInsight[] = [
  {
    id: '1',
    title: 'Market Volatility Detected',
    impact: 'HIGH',
    explanation: 'Unusual trading volume in major indices suggests potential market correction.',
    suggestedAction: 'Review portfolio allocation and risk exposure',
    confidence: 0.92,
  },
  {
    id: '2',
    title: 'Customer Churn Signal',
    impact: 'MEDIUM',
    explanation: 'Account activity patterns indicate increased risk of customer loss.',
    suggestedAction: 'Initiate retention campaign for identified segments',
    confidence: 0.87,
  },
  {
    id: '3',
    title: 'Operational Efficiency Opportunity',
    impact: 'MEDIUM',
    explanation: 'Process mining reveals bottleneck in current workflow.',
    suggestedAction: 'Implement recommended optimization strategy',
    confidence: 0.79,
  },
  {
    id: '4',
    title: 'Competitive Threat Identified',
    impact: 'HIGH',
    explanation: 'New market entrant detected with aggressive pricing strategy.',
    suggestedAction: 'Evaluate competitive response options',
    confidence: 0.85,
  },
]

export const mockAlerts: Alert[] = [
  {
    id: '1',
    title: 'System Health Alert',
    message: 'API response time exceeded threshold',
    priority: 'WARNING',
    timestamp: new Date(Date.now() - 5 * 60000),
    resolved: false,
  },
  {
    id: '2',
    title: 'Data Quality Issue',
    message: '3 missing records detected in latest batch',
    priority: 'INFO',
    timestamp: new Date(Date.now() - 15 * 60000),
    resolved: false,
  },
  {
    id: '3',
    title: 'Critical Event',
    message: 'Suspicious activity detected in transaction stream',
    priority: 'CRITICAL',
    timestamp: new Date(Date.now() - 2 * 60000),
    resolved: false,
  },
]

export const mockFeedItems: FeedItem[] = [
  {
    id: '1',
    title: 'S&P 500 surge',
    description: 'Major indices show strong growth driven by tech sector recovery',
    impact: 'HIGH',
    timestamp: new Date(Date.now() - 3 * 60000),
    source: 'Market Feed',
  },
  {
    id: '2',
    title: 'Competitor price adjustment',
    description: 'Top competitor reduced pricing by 15% on premium tier',
    impact: 'HIGH',
    timestamp: new Date(Date.now() - 8 * 60000),
    source: 'Competitor Intel',
  },
  {
    id: '3',
    title: 'Traffic spike detected',
    description: 'Website traffic increased 45% in past hour',
    impact: 'MEDIUM',
    timestamp: new Date(Date.now() - 12 * 60000),
    source: 'Analytics',
  },
  {
    id: '4',
    title: 'Supply chain update',
    description: 'Key supplier announced 2-week delivery delay',
    impact: 'MEDIUM',
    timestamp: new Date(Date.now() - 25 * 60000),
    source: 'Supply Chain',
  },
]

export const chartData = [
  { time: '00:00', value: 2400, forecast: 2400 },
  { time: '04:00', value: 3200, forecast: 2800 },
  { time: '08:00', value: 2800, forecast: 3100 },
  { time: '12:00', value: 3900, forecast: 3400 },
  { time: '16:00', value: 3200, forecast: 3600 },
  { time: '20:00', value: 4200, forecast: 3900 },
  { time: '24:00', value: 4800, forecast: 4200 },
]

export const activityData = [
  { hour: '00h', decisions: 240, alerts: 12, insights: 8 },
  { hour: '04h', decisions: 320, alerts: 18, insights: 11 },
  { hour: '08h', decisions: 280, alerts: 15, insights: 9 },
  { hour: '12h', decisions: 390, alerts: 22, insights: 14 },
  { hour: '16h', decisions: 320, alerts: 19, insights: 12 },
  { hour: '20h', decisions: 420, alerts: 28, insights: 18 },
  { hour: '24h', decisions: 480, alerts: 32, insights: 21 },
]

/* Generate random feed item */
export function generateRandomFeedItem(): FeedItem {
  const sources = ['Market Feed', 'Competitor Intel', 'Analytics', 'Supply Chain', 'Customer Feedback']
  const impacts: ('HIGH' | 'MEDIUM' | 'LOW')[] = ['HIGH', 'MEDIUM', 'LOW']
  const titles = [
    'Market shift detected',
    'User engagement surge',
    'Performance metric update',
    'Competitor activity',
    'Customer feedback alert',
  ]

  return {
    id: Date.now().toString(),
    title: titles[Math.floor(Math.random() * titles.length)],
    description: 'New data point added to the real-time feed for analysis.',
    impact: impacts[Math.floor(Math.random() * impacts.length)],
    timestamp: new Date(),
    source: sources[Math.floor(Math.random() * sources.length)],
  }
}

/* Generate random alert */
export function generateRandomAlert(): Alert {
  const priorities: ('CRITICAL' | 'WARNING' | 'INFO')[] = ['CRITICAL', 'WARNING', 'INFO']
  const messages = [
    'System threshold exceeded',
    'Anomaly detected in data stream',
    'Performance degradation alert',
    'Quality check failed',
    'Integration status changed',
  ]

  return {
    id: Date.now().toString(),
    title: 'New Alert',
    message: messages[Math.floor(Math.random() * messages.length)],
    priority: priorities[Math.floor(Math.random() * priorities.length)],
    timestamp: new Date(),
    resolved: false,
  }
}
