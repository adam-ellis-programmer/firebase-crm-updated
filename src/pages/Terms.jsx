import { useEffect } from 'react'
const months = [
  'January',
  'Febuary',
  'March',
  'April',
  'May',
  'June',
  'July',
  'August',
  'September',
  'October',
  'November',
  'December',
]
const daysOfWeek = [
  'Sunday',
  'Monday',
  'Tuesday',
  'Wednesday',
  'Thursday',
  'Friday',
  'Saturday',
  'Sunday',
]
const Terms = () => {
  useEffect(() => {
    window.scrollTo({
      top: 0,
    })
    return () => {}
  }, [])
  // Get date from 3 days ago
  const today = new Date()
  // look up the today - 3 * 24 * 60 * 60 * 1000
  const threeDaysAgo = new Date(today - 3 * 24 * 60 * 60 * 1000)
  // console.log(threeDaysAgo.getMonth() + 1)

  // *** leave for reference *** //
  const formatDate = (date) => {
    const day = date.getDate().toString().padStart(2, '0')
    const month = (date.getMonth() + 1).toString().padStart(2, '0')
    const year = date.getFullYear()
    return `${day}/${month}/${year}`
  }

  const lastUpdated = (date) => {
    const day = date.getDate()
    const month = date.getMonth()
    const year = date.getFullYear()
    const dayOfWeek = date.getDay()
    // console.log(dayOfWeek)
    return `last updated on ${daysOfWeek[dayOfWeek]} ${day} ${months[month]} ${year}`
  }

  // console.log(lastUpdated(threeDaysAgo))
  // console.log(formatDate(threeDaysAgo))

  const highlightWords = (text, wordList) => {
    const wordsLower = wordList.map((word) => word.toLowerCase())

    return text.split(' ').map((word, index) => {
      const cleanWord = word.replace(/[.,!?;:]$/, '')

      const punctuation = word.slice(cleanWord.length)

      // has index memory

      if (wordsLower.includes(cleanWord.toLowerCase())) {
        return (
          <span key={index}>
            <span className="bg-orange-500 text-white p-1 rounded-md font-medium">
              {cleanWord}
            </span>
            {punctuation + ' '}
          </span>
        )
      }
      return word + ' '
    })
  }

  const wordsToHighlight = [
    'CRM',
    'data',
    'Easy Data Systems',
    'personal information',
    'privacy',
  ]

  const termsData = [
    {
      title: 'Introduction',
      content:
        'Welcome to Easy Data Systems, a comprehensive CRM solution designed to help businesses manage their customer relationships and data effectively. These Terms and Conditions govern your use of our services.',
    },
    {
      title: 'Service Description',
      content:
        'Easy Data Systems provides cloud-based CRM services, including customer data management, analytics, and reporting tools. Our platform processes and stores data in accordance with industry standards.',
    },
    {
      title: 'Data Privacy and Security',
      content:
        'We take the security of your data seriously. All personal information processed through our CRM system is encrypted and stored securely. Users maintain ownership of their data and can request its deletion at any time.',
    },
    {
      title: 'User Responsibilities',
      content:
        'Users must maintain accurate and up-to-date information in the CRM, protect their account credentials, use the system in compliance with applicable data protection laws, and not misuse or attempt to exploit the system.',
    },
    {
      title: 'Subscription and Billing',
      content:
        'Easy Data Systems operates on a subscription basis. Pricing is based on user count and selected features. All fees are non-refundable unless required by law.',
    },
    {
      title: 'Service Availability',
      content:
        'We strive to maintain 99.9% uptime for our CRM system. Scheduled maintenance will be communicated in advance. We are not liable for service interruptions due to factors beyond our control.',
    },
    {
      title: 'Data Backup',
      content:
        'While we regularly backup all data stored in our CRM, users are encouraged to maintain their own backup copies of critical information.',
    },
    {
      title: 'Intellectual Property',
      content:
        'Easy Data Systems retains all intellectual property rights to the CRM software. Users are granted a limited license to use the system for its intended purpose.',
    },
    {
      title: 'Termination',
      content:
        'We reserve the right to terminate service for violations of these terms. Users may cancel their subscription with 30 days notice.',
    },
    {
      title: 'Privacy Policy',
      content:
        'Our handling of personal information is governed by our Privacy Policy, which is incorporated into these terms by reference.',
    },
  ]

  return (
    <div className="max-w-4xl mx-auto p-8 bg-white shadow-lg rounded-lg">
      <h1 className="text-3xl font-bold mb-6">
        Terms and Conditions for Easy Data Systems CRM
      </h1>

      <ol className="list-decimal space-y-6 pl-6">
        {termsData.map((term, index) => (
          <li key={index} className="pl-2">
            <h2 className="text-xl font-semibold mb-2">{term.title}</h2>
            <div className="text-gray-700">
              {highlightWords(term.content, wordsToHighlight)}
            </div>
          </li>
        ))}
      </ol>

      <div className="mt-8 text-sm text-gray-600">{lastUpdated(threeDaysAgo)}</div>
    </div>
  )
}

export default Terms
