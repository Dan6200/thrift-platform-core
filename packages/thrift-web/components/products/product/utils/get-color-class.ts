// A simple utility to get Tailwind color classes
export const getColorClass = (color: string) => {
  const colorMap: { [key: string]: string } = {
    red: 'bg-red-500',
    blue: 'bg-blue-500',
    green: 'bg-green-500',
    purple: 'bg-purple-500',
    pink: 'bg-pink-500',
    black: 'bg-black',
    white: 'bg-white border border-gray-300',
    silver: 'bg-gray-300',
    // Add more colors as needed
  }
  return colorMap[color.toLowerCase()] || 'bg-gray-200'
}
