/**
 * Returns badge color class based on email stage
 */
export const getBadgeColorClass = (stage: string) => {
  switch(stage) {
    case 'Share Creative Brief':
      return 'bg-purple-500 hover:bg-purple-600 text-white border-transparent';
    case 'Questions':
      return 'bg-yellow-500 hover:bg-yellow-600 text-white border-transparent';
    case 'Rates Received':
      return 'bg-teal-500 hover:bg-teal-600 text-white border-transparent';
    case 'Negotiate Rates':
      return 'bg-orange-500 hover:bg-orange-600 text-white border-transparent';
    case 'Send Contract':
      return 'bg-indigo-500 hover:bg-indigo-600 text-white border-transparent';
    case 'Contract Signed':
      return 'bg-green-700 hover:bg-green-800 text-white border-transparent';
    case 'Content Draft':
      return 'bg-blue-400 hover:bg-blue-500 text-white border-transparent';
    case 'Content Posted':
      return 'bg-green-400 hover:bg-green-500 text-white border-transparent';
    case 'Pass':
      return 'bg-red-500 hover:bg-red-600 text-white border-transparent';
    case 'Other':
    default:
      return 'bg-gray-500 hover:bg-gray-600 text-white border-transparent';
  }
}; 