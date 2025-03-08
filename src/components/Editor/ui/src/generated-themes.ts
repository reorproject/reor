type Theme = {
  color1: string
  color2: string
  color3: string
  color4: string
  color5: string
  color6: string
  color7: string
  color8: string
  color9: string
  color10: string
  color11: string
  color12: string
  background: string
  backgroundHover: string
  backgroundPress: string
  backgroundFocus: string
  backgroundStrong: string
  backgroundTransparent: string
  color: string
  colorHover: string
  colorPress: string
  colorFocus: string
  colorTransparent: string
  borderColor: string
  borderColorHover: string
  borderColorFocus: string
  borderColorPress: string
  placeholderColor: string
  blue1: string
  blue2: string
  blue3: string
  blue4: string
  blue5: string
  blue6: string
  blue7: string
  blue8: string
  blue9: string
  blue10: string
  blue11: string
  blue12: string
  gray1: string
  gray2: string
  gray3: string
  gray4: string
  gray5: string
  gray6: string
  gray7: string
  gray8: string
  gray9: string
  gray10: string
  gray11: string
  gray12: string
  green1: string
  green2: string
  green3: string
  green4: string
  green5: string
  green6: string
  green7: string
  green8: string
  green9: string
  green10: string
  green11: string
  green12: string
  orange1: string
  orange2: string
  orange3: string
  orange4: string
  orange5: string
  orange6: string
  orange7: string
  orange8: string
  orange9: string
  orange10: string
  orange11: string
  orange12: string
  mint1: string
  mint2: string
  mint3: string
  mint4: string
  mint5: string
  mint6: string
  mint7: string
  mint8: string
  mint9: string
  mint10: string
  mint11: string
  mint12: string
  red1: string
  red2: string
  red3: string
  red4: string
  red5: string
  red6: string
  red7: string
  red8: string
  red9: string
  red10: string
  red11: string
  red12: string
  yellow1: string
  yellow2: string
  yellow3: string
  yellow4: string
  yellow5: string
  yellow6: string
  yellow7: string
  yellow8: string
  yellow9: string
  yellow10: string
  yellow11: string
  yellow12: string
  shadowColor: string
  shadowColorHover: string
  shadowColorPress: string
  shadowColorFocus: string
}

function t(a) {
  const res: Record<string, string> = {}
  for (const [ki, vi] of a) {
    // @ts-ignore
    res[ks[ki]] = vs[vi]
  }
  return res
}
const vs = [
  '#fff',
  '#f8f8f8',
  'hsl(0, 0%, 96.3%)',
  'hsl(0, 0%, 94.1%)',
  'hsl(0, 0%, 92.0%)',
  'hsl(0, 0%, 90.0%)',
  'hsl(0, 0%, 88.5%)',
  'hsl(0, 0%, 81.0%)',
  'hsl(0, 0%, 56.1%)',
  'hsl(0, 0%, 50.3%)',
  'hsl(0, 0%, 42.5%)',
  'hsl(0, 0%, 9.0%)',
  'rgba(255,255,255,0)',
  'rgba(10,10,10,0)',
  'hsl(206, 100%, 99.2%)',
  'hsl(210, 100%, 98.0%)',
  'hsl(209, 100%, 96.5%)',
  'hsl(210, 98.8%, 94.0%)',
  'hsl(209, 95.0%, 90.1%)',
  'hsl(209, 81.2%, 84.5%)',
  'hsl(208, 77.5%, 76.9%)',
  'hsl(206, 81.9%, 65.3%)',
  'hsl(206, 100%, 50.0%)',
  'hsl(208, 100%, 47.3%)',
  'hsl(211, 100%, 43.2%)',
  'hsl(211, 100%, 15.0%)',
  'hsl(0, 0%, 99.0%)',
  'hsl(0, 0%, 97.3%)',
  'hsl(0, 0%, 95.1%)',
  'hsl(0, 0%, 93.0%)',
  'hsl(0, 0%, 90.9%)',
  'hsl(0, 0%, 88.7%)',
  'hsl(0, 0%, 85.8%)',
  'hsl(0, 0%, 78.0%)',
  'hsl(0, 0%, 52.3%)',
  'hsl(0, 0%, 43.5%)',
  'hsl(136, 50.0%, 98.9%)',
  'hsl(138, 62.5%, 96.9%)',
  'hsl(139, 55.2%, 94.5%)',
  'hsl(140, 48.7%, 91.0%)',
  'hsl(141, 43.7%, 86.0%)',
  'hsl(143, 40.3%, 79.0%)',
  'hsl(146, 38.5%, 69.0%)',
  'hsl(151, 40.2%, 54.1%)',
  'hsl(151, 55.0%, 41.5%)',
  'hsl(152, 57.5%, 37.6%)',
  'hsl(153, 67.0%, 28.5%)',
  'hsl(155, 40.0%, 14.0%)',
  'hsl(24, 70.0%, 99.0%)',
  'hsl(24, 83.3%, 97.6%)',
  'hsl(24, 100%, 95.3%)',
  'hsl(25, 100%, 92.2%)',
  'hsl(25, 100%, 88.2%)',
  'hsl(25, 100%, 82.8%)',
  'hsl(24, 100%, 75.3%)',
  'hsl(24, 94.5%, 64.3%)',
  'hsl(24, 94.0%, 50.0%)',
  'hsl(24, 100%, 46.5%)',
  'hsl(24, 100%, 37.0%)',
  'hsl(15, 60.0%, 17.0%)',
  'hsl(165, 80.0%, 98.8%)',
  'hsl(164, 88.2%, 96.7%)',
  'hsl(164, 76.6%, 93.3%)',
  'hsl(165, 68.8%, 89.5%)',
  'hsl(165, 60.6%, 84.5%)',
  'hsl(165, 53.5%, 76.9%)',
  'hsl(166, 50.7%, 66.1%)',
  'hsl(168, 52.8%, 51.0%)',
  'hsl(167, 65.0%, 66.0%)',
  'hsl(167, 59.3%, 63.1%)',
  'hsl(172, 72.0%, 28.5%)',
  'hsl(172, 70.0%, 12.0%)',
  'hsl(359, 100%, 99.4%)',
  'hsl(359, 100%, 98.6%)',
  'hsl(360, 100%, 96.8%)',
  'hsl(360, 97.9%, 94.8%)',
  'hsl(360, 90.2%, 91.9%)',
  'hsl(360, 81.7%, 87.8%)',
  'hsl(359, 74.2%, 81.7%)',
  'hsl(359, 69.5%, 74.3%)',
  'hsl(358, 75.0%, 59.0%)',
  'hsl(358, 69.4%, 55.2%)',
  'hsl(358, 65.0%, 48.7%)',
  'hsl(354, 50.0%, 14.6%)',
  'hsl(60, 54.0%, 98.5%)',
  'hsl(52, 100%, 95.5%)',
  'hsl(55, 100%, 90.9%)',
  'hsl(54, 100%, 86.6%)',
  'hsl(52, 97.9%, 82.0%)',
  'hsl(50, 89.4%, 76.1%)',
  'hsl(47, 80.4%, 68.0%)',
  'hsl(48, 100%, 46.1%)',
  'hsl(53, 92.0%, 50.0%)',
  'hsl(50, 100%, 48.5%)',
  'hsl(42, 100%, 29.0%)',
  'hsl(40, 55.0%, 13.5%)',
  'rgba(0,0,0,0.085)',
  'rgba(0,0,0,0.04)',
  '#050505',
  '#151515',
  '#191919',
  '#232323',
  '#282828',
  '#323232',
  '#424242',
  '#494949',
  '#545454',
  '#626262',
  '#a5a5a5',
  'hsl(212, 35.0%, 9.2%)',
  'hsl(216, 50.0%, 11.8%)',
  'hsl(214, 59.4%, 15.3%)',
  'hsl(214, 65.8%, 17.9%)',
  'hsl(213, 71.2%, 20.2%)',
  'hsl(212, 77.4%, 23.1%)',
  'hsl(211, 85.1%, 27.4%)',
  'hsl(211, 89.7%, 34.1%)',
  'hsl(209, 100%, 60.6%)',
  'hsl(210, 100%, 66.1%)',
  'hsl(206, 98.0%, 95.8%)',
  'hsl(0, 0%, 8.5%)',
  'hsl(0, 0%, 11.0%)',
  'hsl(0, 0%, 13.6%)',
  'hsl(0, 0%, 15.8%)',
  'hsl(0, 0%, 17.9%)',
  'hsl(0, 0%, 20.5%)',
  'hsl(0, 0%, 24.3%)',
  'hsl(0, 0%, 31.2%)',
  'hsl(0, 0%, 43.9%)',
  'hsl(0, 0%, 49.4%)',
  'hsl(0, 0%, 62.8%)',
  'hsl(146, 30.0%, 7.4%)',
  'hsl(155, 44.2%, 8.4%)',
  'hsl(155, 46.7%, 10.9%)',
  'hsl(154, 48.4%, 12.9%)',
  'hsl(154, 49.7%, 14.9%)',
  'hsl(154, 50.9%, 17.6%)',
  'hsl(153, 51.8%, 21.8%)',
  'hsl(151, 51.7%, 28.4%)',
  'hsl(151, 49.3%, 46.5%)',
  'hsl(151, 50.0%, 53.2%)',
  'hsl(137, 72.0%, 94.0%)',
  'hsl(30, 70.0%, 7.2%)',
  'hsl(28, 100%, 8.4%)',
  'hsl(26, 91.1%, 11.6%)',
  'hsl(25, 88.3%, 14.1%)',
  'hsl(24, 87.6%, 16.6%)',
  'hsl(24, 88.6%, 19.8%)',
  'hsl(24, 92.4%, 24.0%)',
  'hsl(25, 100%, 29.0%)',
  'hsl(24, 100%, 58.5%)',
  'hsl(24, 100%, 62.2%)',
  'hsl(24, 97.0%, 93.2%)',
  'hsl(173, 50.0%, 6.6%)',
  'hsl(176, 73.0%, 7.3%)',
  'hsl(175, 79.3%, 8.9%)',
  'hsl(174, 84.8%, 10.3%)',
  'hsl(174, 90.2%, 11.9%)',
  'hsl(173, 96.0%, 13.8%)',
  'hsl(172, 100%, 16.8%)',
  'hsl(170, 100%, 21.4%)',
  'hsl(163, 80.0%, 77.0%)',
  'hsl(167, 70.0%, 48.0%)',
  'hsl(165, 80.0%, 94.8%)',
  'hsl(353, 23.0%, 9.8%)',
  'hsl(357, 34.4%, 12.0%)',
  'hsl(356, 43.4%, 16.4%)',
  'hsl(356, 47.6%, 19.2%)',
  'hsl(356, 51.1%, 21.9%)',
  'hsl(356, 55.2%, 25.9%)',
  'hsl(357, 60.2%, 31.8%)',
  'hsl(358, 65.0%, 40.4%)',
  'hsl(358, 85.3%, 64.0%)',
  'hsl(358, 100%, 69.5%)',
  'hsl(351, 89.0%, 96.0%)',
  'hsl(45, 100%, 5.5%)',
  'hsl(46, 100%, 6.7%)',
  'hsl(45, 100%, 8.7%)',
  'hsl(45, 100%, 10.4%)',
  'hsl(47, 100%, 12.1%)',
  'hsl(49, 100%, 14.3%)',
  'hsl(49, 90.3%, 18.4%)',
  'hsl(50, 100%, 22.0%)',
  'hsl(54, 100%, 68.0%)',
  'hsl(48, 100%, 47.0%)',
  'hsl(53, 100%, 91.0%)',
  'rgba(0,0,0,0.3)',
  'rgba(0,0,0,0.2)',
  'hsla(24, 70.0%, 99.0%, 0)',
  'hsla(15, 60.0%, 17.0%, 0)',
  'hsla(60, 54.0%, 98.5%, 0)',
  'hsla(40, 55.0%, 13.5%, 0)',
  'hsla(136, 50.0%, 98.9%, 0)',
  'hsla(155, 40.0%, 14.0%, 0)',
  'hsla(206, 100%, 99.2%, 0)',
  'hsla(211, 100%, 15.0%, 0)',
  'hsla(165, 80.0%, 98.8%, 0)',
  'hsla(172, 70.0%, 12.0%, 0)',
  'hsla(359, 100%, 99.4%, 0)',
  'hsla(354, 50.0%, 14.6%, 0)',
  'hsla(30, 70.0%, 7.2%, 0)',
  'hsla(24, 97.0%, 93.2%, 0)',
  'hsla(45, 100%, 5.5%, 0)',
  'hsla(53, 100%, 91.0%, 0)',
  'hsla(146, 30.0%, 7.4%, 0)',
  'hsla(137, 72.0%, 94.0%, 0)',
  'hsla(212, 35.0%, 9.2%, 0)',
  'hsla(206, 98.0%, 95.8%, 0)',
  'hsla(173, 50.0%, 6.6%, 0)',
  'hsla(165, 80.0%, 94.8%, 0)',
  'hsla(353, 23.0%, 9.8%, 0)',
  'hsla(351, 89.0%, 96.0%, 0)',
  'rgba(0,0,0,0.5)',
  'rgba(0,0,0,0.9)',
]

const ks = [
  'color1',
  'color2',
  'color3',
  'color4',
  'color5',
  'color6',
  'color7',
  'color8',
  'color9',
  'color10',
  'color11',
  'color12',
  'background',
  'backgroundHover',
  'backgroundPress',
  'backgroundFocus',
  'backgroundStrong',
  'backgroundTransparent',
  'color',
  'colorHover',
  'colorPress',
  'colorFocus',
  'colorTransparent',
  'borderColor',
  'borderColorHover',
  'borderColorFocus',
  'borderColorPress',
  'placeholderColor',
  'blue1',
  'blue2',
  'blue3',
  'blue4',
  'blue5',
  'blue6',
  'blue7',
  'blue8',
  'blue9',
  'blue10',
  'blue11',
  'blue12',
  'gray1',
  'gray2',
  'gray3',
  'gray4',
  'gray5',
  'gray6',
  'gray7',
  'gray8',
  'gray9',
  'gray10',
  'gray11',
  'gray12',
  'green1',
  'green2',
  'green3',
  'green4',
  'green5',
  'green6',
  'green7',
  'green8',
  'green9',
  'green10',
  'green11',
  'green12',
  'orange1',
  'orange2',
  'orange3',
  'orange4',
  'orange5',
  'orange6',
  'orange7',
  'orange8',
  'orange9',
  'orange10',
  'orange11',
  'orange12',
  'mint1',
  'mint2',
  'mint3',
  'mint4',
  'mint5',
  'mint6',
  'mint7',
  'mint8',
  'mint9',
  'mint10',
  'mint11',
  'mint12',
  'red1',
  'red2',
  'red3',
  'red4',
  'red5',
  'red6',
  'red7',
  'red8',
  'red9',
  'red10',
  'red11',
  'red12',
  'yellow1',
  'yellow2',
  'yellow3',
  'yellow4',
  'yellow5',
  'yellow6',
  'yellow7',
  'yellow8',
  'yellow9',
  'yellow10',
  'yellow11',
  'yellow12',
  'shadowColor',
  'shadowColorHover',
  'shadowColorPress',
  'shadowColorFocus',
]

const n1 = t([
  [0, 0],
  [1, 1],
  [2, 2],
  [3, 3],
  [4, 4],
  [5, 5],
  [6, 6],
  [7, 7],
  [8, 8],
  [9, 9],
  [10, 10],
  [11, 11],
  [12, 1],
  [13, 2],
  [14, 3],
  [15, 4],
  [16, 0],
  [17, 12],
  [18, 11],
  [19, 10],
  [20, 11],
  [21, 10],
  [22, 13],
  [23, 4],
  [24, 5],
  [25, 3],
  [26, 4],
  [27, 8],
  [28, 14],
  [29, 15],
  [30, 16],
  [31, 17],
  [32, 18],
  [33, 19],
  [34, 20],
  [35, 21],
  [36, 22],
  [37, 23],
  [38, 24],
  [39, 25],
  [40, 26],
  [41, 27],
  [42, 28],
  [43, 29],
  [44, 30],
  [45, 31],
  [46, 32],
  [47, 33],
  [48, 8],
  [49, 34],
  [50, 35],
  [51, 11],
  [52, 36],
  [53, 37],
  [54, 38],
  [55, 39],
  [56, 40],
  [57, 41],
  [58, 42],
  [59, 43],
  [60, 44],
  [61, 45],
  [62, 46],
  [63, 47],
  [64, 48],
  [65, 49],
  [66, 50],
  [67, 51],
  [68, 52],
  [69, 53],
  [70, 54],
  [71, 55],
  [72, 56],
  [73, 57],
  [74, 58],
  [75, 59],
  [76, 60],
  [77, 61],
  [78, 62],
  [79, 63],
  [80, 64],
  [81, 65],
  [82, 66],
  [83, 67],
  [84, 68],
  [85, 69],
  [86, 70],
  [87, 71],
  [88, 72],
  [89, 73],
  [90, 74],
  [91, 75],
  [92, 76],
  [93, 77],
  [94, 78],
  [95, 79],
  [96, 80],
  [97, 81],
  [98, 82],
  [99, 83],
  [100, 84],
  [101, 85],
  [102, 86],
  [103, 87],
  [104, 88],
  [105, 89],
  [106, 90],
  [107, 91],
  [108, 92],
  [109, 93],
  [110, 94],
  [111, 95],
  [112, 96],
  [113, 96],
  [114, 97],
  [115, 97],
]) as Theme

export const light = n1 as Theme
const n2 = t([
  [0, 98],
  [1, 99],
  [2, 100],
  [3, 101],
  [4, 102],
  [5, 103],
  [6, 104],
  [7, 105],
  [8, 106],
  [9, 107],
  [10, 108],
  [11, 0],
  [12, 99],
  [13, 100],
  [14, 101],
  [15, 102],
  [16, 98],
  [17, 13],
  [18, 0],
  [19, 108],
  [20, 0],
  [21, 108],
  [22, 12],
  [23, 102],
  [24, 103],
  [25, 101],
  [26, 102],
  [27, 106],
  [28, 109],
  [29, 110],
  [30, 111],
  [31, 112],
  [32, 113],
  [33, 114],
  [34, 115],
  [35, 116],
  [36, 22],
  [37, 117],
  [38, 118],
  [39, 119],
  [40, 120],
  [41, 121],
  [42, 122],
  [43, 123],
  [44, 124],
  [45, 125],
  [46, 126],
  [47, 127],
  [48, 128],
  [49, 129],
  [50, 130],
  [51, 29],
  [52, 131],
  [53, 132],
  [54, 133],
  [55, 134],
  [56, 135],
  [57, 136],
  [58, 137],
  [59, 138],
  [60, 44],
  [61, 139],
  [62, 140],
  [63, 141],
  [64, 142],
  [65, 143],
  [66, 144],
  [67, 145],
  [68, 146],
  [69, 147],
  [70, 148],
  [71, 149],
  [72, 56],
  [73, 150],
  [74, 151],
  [75, 152],
  [76, 153],
  [77, 154],
  [78, 155],
  [79, 156],
  [80, 157],
  [81, 158],
  [82, 159],
  [83, 160],
  [84, 68],
  [85, 161],
  [86, 162],
  [87, 163],
  [88, 164],
  [89, 165],
  [90, 166],
  [91, 167],
  [92, 168],
  [93, 169],
  [94, 170],
  [95, 171],
  [96, 80],
  [97, 172],
  [98, 173],
  [99, 174],
  [100, 175],
  [101, 176],
  [102, 177],
  [103, 178],
  [104, 179],
  [105, 180],
  [106, 181],
  [107, 182],
  [108, 92],
  [109, 183],
  [110, 184],
  [111, 185],
  [112, 186],
  [113, 186],
  [114, 187],
  [115, 187],
]) as Theme

export const dark = n2 as Theme
const n3 = t([
  [0, 48],
  [1, 49],
  [2, 50],
  [3, 51],
  [4, 52],
  [5, 53],
  [6, 55],
  [7, 56],
  [8, 57],
  [9, 58],
  [10, 59],
  [11, 11],
  [12, 49],
  [13, 50],
  [14, 51],
  [15, 52],
  [16, 48],
  [17, 188],
  [18, 11],
  [19, 59],
  [20, 11],
  [21, 59],
  [22, 189],
  [23, 51],
  [24, 52],
  [25, 51],
  [26, 51],
  [27, 57],
]) as Theme

export const light_orange = n3 as Theme
const n4 = t([
  [0, 84],
  [1, 85],
  [2, 86],
  [3, 87],
  [4, 88],
  [5, 89],
  [6, 91],
  [7, 92],
  [8, 93],
  [9, 94],
  [10, 95],
  [11, 11],
  [12, 85],
  [13, 86],
  [14, 87],
  [15, 88],
  [16, 84],
  [17, 190],
  [18, 11],
  [19, 95],
  [20, 11],
  [21, 95],
  [22, 191],
  [23, 87],
  [24, 88],
  [25, 87],
  [26, 87],
  [27, 93],
]) as Theme

export const light_yellow = n4 as Theme
const n5 = t([
  [0, 36],
  [1, 37],
  [2, 38],
  [3, 39],
  [4, 40],
  [5, 41],
  [6, 43],
  [7, 44],
  [8, 45],
  [9, 46],
  [10, 47],
  [11, 11],
  [12, 37],
  [13, 38],
  [14, 39],
  [15, 40],
  [16, 36],
  [17, 192],
  [18, 11],
  [19, 47],
  [20, 11],
  [21, 47],
  [22, 193],
  [23, 39],
  [24, 40],
  [25, 39],
  [26, 39],
  [27, 45],
]) as Theme

export const light_green = n5 as Theme
const n6 = t([
  [0, 14],
  [1, 15],
  [2, 16],
  [3, 17],
  [4, 18],
  [5, 19],
  [6, 21],
  [7, 22],
  [8, 23],
  [9, 24],
  [10, 25],
  [11, 11],
  [12, 15],
  [13, 16],
  [14, 17],
  [15, 18],
  [16, 14],
  [17, 194],
  [18, 11],
  [19, 25],
  [20, 11],
  [21, 25],
  [22, 195],
  [23, 17],
  [24, 18],
  [25, 17],
  [26, 17],
  [27, 23],
]) as Theme

export const light_blue = n6 as Theme
const n7 = t([
  [0, 60],
  [1, 61],
  [2, 62],
  [3, 63],
  [4, 64],
  [5, 65],
  [6, 67],
  [7, 68],
  [8, 69],
  [9, 70],
  [10, 71],
  [11, 11],
  [12, 61],
  [13, 62],
  [14, 63],
  [15, 64],
  [16, 60],
  [17, 196],
  [18, 11],
  [19, 71],
  [20, 11],
  [21, 71],
  [22, 197],
  [23, 63],
  [24, 64],
  [25, 63],
  [26, 63],
  [27, 69],
]) as Theme

export const light_mint = n7 as Theme
const n8 = t([
  [0, 72],
  [1, 73],
  [2, 74],
  [3, 75],
  [4, 76],
  [5, 77],
  [6, 79],
  [7, 80],
  [8, 81],
  [9, 82],
  [10, 83],
  [11, 11],
  [12, 73],
  [13, 74],
  [14, 75],
  [15, 76],
  [16, 72],
  [17, 198],
  [18, 11],
  [19, 83],
  [20, 11],
  [21, 83],
  [22, 199],
  [23, 75],
  [24, 76],
  [25, 75],
  [26, 75],
  [27, 81],
]) as Theme

export const light_red = n8 as Theme
const n9 = t([
  [0, 142],
  [1, 143],
  [2, 144],
  [3, 145],
  [4, 146],
  [5, 147],
  [6, 149],
  [7, 56],
  [8, 150],
  [9, 151],
  [10, 152],
  [11, 0],
  [12, 143],
  [13, 144],
  [14, 145],
  [15, 146],
  [16, 142],
  [17, 200],
  [18, 0],
  [19, 152],
  [20, 0],
  [21, 152],
  [22, 201],
  [23, 146],
  [24, 147],
  [25, 145],
  [26, 146],
  [27, 150],
]) as Theme

export const dark_orange = n9 as Theme
export const dark_orange_ListItem = n9 as Theme
const n10 = t([
  [0, 175],
  [1, 176],
  [2, 177],
  [3, 178],
  [4, 179],
  [5, 180],
  [6, 182],
  [7, 92],
  [8, 183],
  [9, 184],
  [10, 185],
  [11, 0],
  [12, 176],
  [13, 177],
  [14, 178],
  [15, 179],
  [16, 175],
  [17, 202],
  [18, 0],
  [19, 185],
  [20, 0],
  [21, 185],
  [22, 203],
  [23, 179],
  [24, 180],
  [25, 178],
  [26, 179],
  [27, 183],
]) as Theme

export const dark_yellow = n10 as Theme
export const dark_yellow_ListItem = n10 as Theme
const n11 = t([
  [0, 131],
  [1, 132],
  [2, 133],
  [3, 134],
  [4, 135],
  [5, 136],
  [6, 138],
  [7, 44],
  [8, 139],
  [9, 140],
  [10, 141],
  [11, 0],
  [12, 132],
  [13, 133],
  [14, 134],
  [15, 135],
  [16, 131],
  [17, 204],
  [18, 0],
  [19, 141],
  [20, 0],
  [21, 141],
  [22, 205],
  [23, 135],
  [24, 136],
  [25, 134],
  [26, 135],
  [27, 139],
]) as Theme

export const dark_green = n11 as Theme
export const dark_green_ListItem = n11 as Theme
const n12 = t([
  [0, 109],
  [1, 110],
  [2, 111],
  [3, 112],
  [4, 113],
  [5, 114],
  [6, 116],
  [7, 22],
  [8, 117],
  [9, 118],
  [10, 119],
  [11, 0],
  [12, 110],
  [13, 111],
  [14, 112],
  [15, 113],
  [16, 109],
  [17, 206],
  [18, 0],
  [19, 119],
  [20, 0],
  [21, 119],
  [22, 207],
  [23, 113],
  [24, 114],
  [25, 112],
  [26, 113],
  [27, 117],
]) as Theme

export const dark_blue = n12 as Theme
export const dark_blue_ListItem = n12 as Theme
const n13 = t([
  [0, 153],
  [1, 154],
  [2, 155],
  [3, 156],
  [4, 157],
  [5, 158],
  [6, 160],
  [7, 68],
  [8, 161],
  [9, 162],
  [10, 163],
  [11, 0],
  [12, 154],
  [13, 155],
  [14, 156],
  [15, 157],
  [16, 153],
  [17, 208],
  [18, 0],
  [19, 163],
  [20, 0],
  [21, 163],
  [22, 209],
  [23, 157],
  [24, 158],
  [25, 156],
  [26, 157],
  [27, 161],
]) as Theme

export const dark_mint = n13 as Theme
export const dark_mint_ListItem = n13 as Theme
const n14 = t([
  [0, 164],
  [1, 165],
  [2, 166],
  [3, 167],
  [4, 168],
  [5, 169],
  [6, 171],
  [7, 80],
  [8, 172],
  [9, 173],
  [10, 174],
  [11, 0],
  [12, 165],
  [13, 166],
  [14, 167],
  [15, 168],
  [16, 164],
  [17, 210],
  [18, 0],
  [19, 174],
  [20, 0],
  [21, 174],
  [22, 211],
  [23, 168],
  [24, 169],
  [25, 167],
  [26, 168],
  [27, 172],
]) as Theme

export const dark_red = n14 as Theme
export const dark_red_ListItem = n14 as Theme
const n15 = t([[12, 212]]) as Theme

export const light_SheetOverlay = n15 as Theme
export const light_DialogOverlay = n15 as Theme
export const light_ModalOverlay = n15 as Theme
export const light_orange_SheetOverlay = n15 as Theme
export const light_orange_DialogOverlay = n15 as Theme
export const light_orange_ModalOverlay = n15 as Theme
export const light_yellow_SheetOverlay = n15 as Theme
export const light_yellow_DialogOverlay = n15 as Theme
export const light_yellow_ModalOverlay = n15 as Theme
export const light_green_SheetOverlay = n15 as Theme
export const light_green_DialogOverlay = n15 as Theme
export const light_green_ModalOverlay = n15 as Theme
export const light_blue_SheetOverlay = n15 as Theme
export const light_blue_DialogOverlay = n15 as Theme
export const light_blue_ModalOverlay = n15 as Theme
export const light_mint_SheetOverlay = n15 as Theme
export const light_mint_DialogOverlay = n15 as Theme
export const light_mint_ModalOverlay = n15 as Theme
export const light_red_SheetOverlay = n15 as Theme
export const light_red_DialogOverlay = n15 as Theme
export const light_red_ModalOverlay = n15 as Theme
export const light_alt1_SheetOverlay = n15 as Theme
export const light_alt1_DialogOverlay = n15 as Theme
export const light_alt1_ModalOverlay = n15 as Theme
export const light_alt2_SheetOverlay = n15 as Theme
export const light_alt2_DialogOverlay = n15 as Theme
export const light_alt2_ModalOverlay = n15 as Theme
export const light_active_SheetOverlay = n15 as Theme
export const light_active_DialogOverlay = n15 as Theme
export const light_active_ModalOverlay = n15 as Theme
export const light_orange_alt1_SheetOverlay = n15 as Theme
export const light_orange_alt1_DialogOverlay = n15 as Theme
export const light_orange_alt1_ModalOverlay = n15 as Theme
export const light_orange_alt2_SheetOverlay = n15 as Theme
export const light_orange_alt2_DialogOverlay = n15 as Theme
export const light_orange_alt2_ModalOverlay = n15 as Theme
export const light_orange_active_SheetOverlay = n15 as Theme
export const light_orange_active_DialogOverlay = n15 as Theme
export const light_orange_active_ModalOverlay = n15 as Theme
export const light_yellow_alt1_SheetOverlay = n15 as Theme
export const light_yellow_alt1_DialogOverlay = n15 as Theme
export const light_yellow_alt1_ModalOverlay = n15 as Theme
export const light_yellow_alt2_SheetOverlay = n15 as Theme
export const light_yellow_alt2_DialogOverlay = n15 as Theme
export const light_yellow_alt2_ModalOverlay = n15 as Theme
export const light_yellow_active_SheetOverlay = n15 as Theme
export const light_yellow_active_DialogOverlay = n15 as Theme
export const light_yellow_active_ModalOverlay = n15 as Theme
export const light_green_alt1_SheetOverlay = n15 as Theme
export const light_green_alt1_DialogOverlay = n15 as Theme
export const light_green_alt1_ModalOverlay = n15 as Theme
export const light_green_alt2_SheetOverlay = n15 as Theme
export const light_green_alt2_DialogOverlay = n15 as Theme
export const light_green_alt2_ModalOverlay = n15 as Theme
export const light_green_active_SheetOverlay = n15 as Theme
export const light_green_active_DialogOverlay = n15 as Theme
export const light_green_active_ModalOverlay = n15 as Theme
export const light_blue_alt1_SheetOverlay = n15 as Theme
export const light_blue_alt1_DialogOverlay = n15 as Theme
export const light_blue_alt1_ModalOverlay = n15 as Theme
export const light_blue_alt2_SheetOverlay = n15 as Theme
export const light_blue_alt2_DialogOverlay = n15 as Theme
export const light_blue_alt2_ModalOverlay = n15 as Theme
export const light_blue_active_SheetOverlay = n15 as Theme
export const light_blue_active_DialogOverlay = n15 as Theme
export const light_blue_active_ModalOverlay = n15 as Theme
export const light_mint_alt1_SheetOverlay = n15 as Theme
export const light_mint_alt1_DialogOverlay = n15 as Theme
export const light_mint_alt1_ModalOverlay = n15 as Theme
export const light_mint_alt2_SheetOverlay = n15 as Theme
export const light_mint_alt2_DialogOverlay = n15 as Theme
export const light_mint_alt2_ModalOverlay = n15 as Theme
export const light_mint_active_SheetOverlay = n15 as Theme
export const light_mint_active_DialogOverlay = n15 as Theme
export const light_mint_active_ModalOverlay = n15 as Theme
export const light_red_alt1_SheetOverlay = n15 as Theme
export const light_red_alt1_DialogOverlay = n15 as Theme
export const light_red_alt1_ModalOverlay = n15 as Theme
export const light_red_alt2_SheetOverlay = n15 as Theme
export const light_red_alt2_DialogOverlay = n15 as Theme
export const light_red_alt2_ModalOverlay = n15 as Theme
export const light_red_active_SheetOverlay = n15 as Theme
export const light_red_active_DialogOverlay = n15 as Theme
export const light_red_active_ModalOverlay = n15 as Theme
const n16 = t([[12, 213]]) as Theme

export const dark_SheetOverlay = n16 as Theme
export const dark_DialogOverlay = n16 as Theme
export const dark_ModalOverlay = n16 as Theme
export const dark_orange_SheetOverlay = n16 as Theme
export const dark_orange_DialogOverlay = n16 as Theme
export const dark_orange_ModalOverlay = n16 as Theme
export const dark_yellow_SheetOverlay = n16 as Theme
export const dark_yellow_DialogOverlay = n16 as Theme
export const dark_yellow_ModalOverlay = n16 as Theme
export const dark_green_SheetOverlay = n16 as Theme
export const dark_green_DialogOverlay = n16 as Theme
export const dark_green_ModalOverlay = n16 as Theme
export const dark_blue_SheetOverlay = n16 as Theme
export const dark_blue_DialogOverlay = n16 as Theme
export const dark_blue_ModalOverlay = n16 as Theme
export const dark_mint_SheetOverlay = n16 as Theme
export const dark_mint_DialogOverlay = n16 as Theme
export const dark_mint_ModalOverlay = n16 as Theme
export const dark_red_SheetOverlay = n16 as Theme
export const dark_red_DialogOverlay = n16 as Theme
export const dark_red_ModalOverlay = n16 as Theme
export const dark_alt1_SheetOverlay = n16 as Theme
export const dark_alt1_DialogOverlay = n16 as Theme
export const dark_alt1_ModalOverlay = n16 as Theme
export const dark_alt2_SheetOverlay = n16 as Theme
export const dark_alt2_DialogOverlay = n16 as Theme
export const dark_alt2_ModalOverlay = n16 as Theme
export const dark_active_SheetOverlay = n16 as Theme
export const dark_active_DialogOverlay = n16 as Theme
export const dark_active_ModalOverlay = n16 as Theme
export const dark_orange_alt1_SheetOverlay = n16 as Theme
export const dark_orange_alt1_DialogOverlay = n16 as Theme
export const dark_orange_alt1_ModalOverlay = n16 as Theme
export const dark_orange_alt2_SheetOverlay = n16 as Theme
export const dark_orange_alt2_DialogOverlay = n16 as Theme
export const dark_orange_alt2_ModalOverlay = n16 as Theme
export const dark_orange_active_SheetOverlay = n16 as Theme
export const dark_orange_active_DialogOverlay = n16 as Theme
export const dark_orange_active_ModalOverlay = n16 as Theme
export const dark_yellow_alt1_SheetOverlay = n16 as Theme
export const dark_yellow_alt1_DialogOverlay = n16 as Theme
export const dark_yellow_alt1_ModalOverlay = n16 as Theme
export const dark_yellow_alt2_SheetOverlay = n16 as Theme
export const dark_yellow_alt2_DialogOverlay = n16 as Theme
export const dark_yellow_alt2_ModalOverlay = n16 as Theme
export const dark_yellow_active_SheetOverlay = n16 as Theme
export const dark_yellow_active_DialogOverlay = n16 as Theme
export const dark_yellow_active_ModalOverlay = n16 as Theme
export const dark_green_alt1_SheetOverlay = n16 as Theme
export const dark_green_alt1_DialogOverlay = n16 as Theme
export const dark_green_alt1_ModalOverlay = n16 as Theme
export const dark_green_alt2_SheetOverlay = n16 as Theme
export const dark_green_alt2_DialogOverlay = n16 as Theme
export const dark_green_alt2_ModalOverlay = n16 as Theme
export const dark_green_active_SheetOverlay = n16 as Theme
export const dark_green_active_DialogOverlay = n16 as Theme
export const dark_green_active_ModalOverlay = n16 as Theme
export const dark_blue_alt1_SheetOverlay = n16 as Theme
export const dark_blue_alt1_DialogOverlay = n16 as Theme
export const dark_blue_alt1_ModalOverlay = n16 as Theme
export const dark_blue_alt2_SheetOverlay = n16 as Theme
export const dark_blue_alt2_DialogOverlay = n16 as Theme
export const dark_blue_alt2_ModalOverlay = n16 as Theme
export const dark_blue_active_SheetOverlay = n16 as Theme
export const dark_blue_active_DialogOverlay = n16 as Theme
export const dark_blue_active_ModalOverlay = n16 as Theme
export const dark_mint_alt1_SheetOverlay = n16 as Theme
export const dark_mint_alt1_DialogOverlay = n16 as Theme
export const dark_mint_alt1_ModalOverlay = n16 as Theme
export const dark_mint_alt2_SheetOverlay = n16 as Theme
export const dark_mint_alt2_DialogOverlay = n16 as Theme
export const dark_mint_alt2_ModalOverlay = n16 as Theme
export const dark_mint_active_SheetOverlay = n16 as Theme
export const dark_mint_active_DialogOverlay = n16 as Theme
export const dark_mint_active_ModalOverlay = n16 as Theme
export const dark_red_alt1_SheetOverlay = n16 as Theme
export const dark_red_alt1_DialogOverlay = n16 as Theme
export const dark_red_alt1_ModalOverlay = n16 as Theme
export const dark_red_alt2_SheetOverlay = n16 as Theme
export const dark_red_alt2_DialogOverlay = n16 as Theme
export const dark_red_alt2_ModalOverlay = n16 as Theme
export const dark_red_active_SheetOverlay = n16 as Theme
export const dark_red_active_DialogOverlay = n16 as Theme
export const dark_red_active_ModalOverlay = n16 as Theme
const n17 = t([
  [0, 1],
  [1, 2],
  [2, 3],
  [3, 4],
  [4, 5],
  [5, 6],
  [6, 7],
  [7, 8],
  [8, 9],
  [9, 10],
  [10, 11],
  [11, 11],
  [12, 2],
  [13, 3],
  [14, 4],
  [15, 5],
  [16, 1],
  [17, 0],
  [18, 10],
  [19, 9],
  [20, 10],
  [21, 9],
  [22, 11],
  [23, 5],
  [24, 6],
  [25, 4],
  [26, 5],
  [27, 7],
]) as Theme

export const light_alt1 = n17 as Theme
const n18 = t([
  [0, 2],
  [1, 3],
  [2, 4],
  [3, 5],
  [4, 6],
  [5, 7],
  [6, 8],
  [7, 9],
  [8, 10],
  [9, 11],
  [10, 11],
  [11, 11],
  [12, 3],
  [13, 4],
  [14, 5],
  [15, 6],
  [16, 2],
  [17, 1],
  [18, 9],
  [19, 8],
  [20, 9],
  [21, 8],
  [22, 10],
  [23, 5],
  [24, 6],
  [25, 4],
  [26, 5],
  [27, 6],
]) as Theme

export const light_alt2 = n18 as Theme
const n19 = t([
  [0, 3],
  [1, 4],
  [2, 5],
  [3, 6],
  [4, 7],
  [5, 8],
  [6, 9],
  [7, 10],
  [8, 11],
  [9, 13],
  [10, 13],
  [11, 13],
  [12, 4],
  [13, 5],
  [14, 6],
  [15, 7],
  [16, 3],
  [17, 2],
  [19, 7],
  [20, 8],
  [21, 7],
  [22, 9],
  [23, 6],
  [24, 7],
  [25, 5],
  [26, 6],
  [27, 5],
]) as Theme

export const light_active = n19 as Theme
const n20 = t([
  [0, 99],
  [1, 100],
  [2, 101],
  [3, 102],
  [4, 103],
  [5, 104],
  [6, 105],
  [7, 106],
  [8, 107],
  [9, 108],
  [10, 0],
  [11, 0],
  [12, 100],
  [13, 101],
  [14, 102],
  [15, 103],
  [16, 99],
  [17, 98],
  [18, 108],
  [19, 107],
  [20, 108],
  [21, 107],
  [22, 0],
  [23, 103],
  [24, 104],
  [25, 102],
  [26, 103],
  [27, 105],
]) as Theme

export const dark_alt1 = n20 as Theme
export const dark_alt1_ListItem = n20 as Theme
const n21 = t([
  [0, 100],
  [1, 101],
  [2, 102],
  [3, 103],
  [4, 104],
  [5, 105],
  [6, 106],
  [7, 107],
  [8, 108],
  [9, 0],
  [10, 0],
  [11, 0],
  [12, 101],
  [13, 102],
  [14, 103],
  [15, 104],
  [16, 100],
  [17, 99],
  [18, 107],
  [19, 106],
  [20, 107],
  [21, 106],
  [22, 108],
  [23, 103],
  [24, 104],
  [25, 102],
  [26, 103],
  [27, 104],
]) as Theme

export const dark_alt2 = n21 as Theme
export const dark_alt2_ListItem = n21 as Theme
const n22 = t([
  [0, 101],
  [1, 102],
  [2, 103],
  [3, 104],
  [4, 105],
  [5, 106],
  [6, 107],
  [7, 108],
  [8, 0],
  [9, 12],
  [10, 12],
  [11, 12],
  [12, 102],
  [13, 103],
  [14, 104],
  [15, 105],
  [16, 101],
  [17, 100],
  [19, 105],
  [20, 106],
  [21, 105],
  [22, 107],
  [23, 104],
  [24, 105],
  [25, 103],
  [26, 104],
  [27, 103],
]) as Theme

export const dark_active = n22 as Theme
export const dark_active_ListItem = n22 as Theme
const n23 = t([
  [0, 49],
  [1, 50],
  [2, 51],
  [3, 52],
  [4, 53],
  [5, 55],
  [6, 56],
  [7, 57],
  [8, 58],
  [9, 59],
  [10, 11],
  [11, 11],
  [12, 50],
  [13, 51],
  [14, 52],
  [15, 53],
  [16, 49],
  [17, 48],
  [18, 59],
  [19, 58],
  [20, 59],
  [21, 58],
  [22, 11],
  [23, 52],
  [24, 53],
  [25, 52],
  [26, 52],
  [27, 56],
]) as Theme

export const light_orange_alt1 = n23 as Theme
const n24 = t([
  [0, 50],
  [1, 51],
  [2, 52],
  [3, 53],
  [4, 55],
  [5, 56],
  [6, 57],
  [7, 58],
  [8, 59],
  [9, 11],
  [10, 11],
  [11, 11],
  [12, 51],
  [13, 52],
  [14, 53],
  [15, 55],
  [16, 50],
  [17, 49],
  [18, 58],
  [19, 57],
  [20, 58],
  [21, 57],
  [22, 59],
  [23, 52],
  [24, 53],
  [25, 52],
  [26, 52],
  [27, 55],
]) as Theme

export const light_orange_alt2 = n24 as Theme
const n25 = t([
  [0, 51],
  [1, 52],
  [2, 53],
  [3, 55],
  [4, 56],
  [5, 57],
  [6, 58],
  [7, 59],
  [8, 11],
  [9, 189],
  [10, 189],
  [11, 189],
  [12, 52],
  [13, 53],
  [14, 55],
  [15, 56],
  [16, 51],
  [17, 50],
  [19, 56],
  [20, 57],
  [21, 56],
  [22, 58],
  [23, 53],
  [24, 55],
  [25, 53],
  [26, 53],
  [27, 53],
]) as Theme

export const light_orange_active = n25 as Theme
const n26 = t([
  [0, 85],
  [1, 86],
  [2, 87],
  [3, 88],
  [4, 89],
  [5, 91],
  [6, 92],
  [7, 93],
  [8, 94],
  [9, 95],
  [10, 11],
  [11, 11],
  [12, 86],
  [13, 87],
  [14, 88],
  [15, 89],
  [16, 85],
  [17, 84],
  [18, 95],
  [19, 94],
  [20, 95],
  [21, 94],
  [22, 11],
  [23, 88],
  [24, 89],
  [25, 88],
  [26, 88],
  [27, 92],
]) as Theme

export const light_yellow_alt1 = n26 as Theme
const n27 = t([
  [0, 86],
  [1, 87],
  [2, 88],
  [3, 89],
  [4, 91],
  [5, 92],
  [6, 93],
  [7, 94],
  [8, 95],
  [9, 11],
  [10, 11],
  [11, 11],
  [12, 87],
  [13, 88],
  [14, 89],
  [15, 91],
  [16, 86],
  [17, 85],
  [18, 94],
  [19, 93],
  [20, 94],
  [21, 93],
  [22, 95],
  [23, 88],
  [24, 89],
  [25, 88],
  [26, 88],
  [27, 91],
]) as Theme

export const light_yellow_alt2 = n27 as Theme
const n28 = t([
  [0, 87],
  [1, 88],
  [2, 89],
  [3, 91],
  [4, 92],
  [5, 93],
  [6, 94],
  [7, 95],
  [8, 11],
  [9, 191],
  [10, 191],
  [11, 191],
  [12, 88],
  [13, 89],
  [14, 91],
  [15, 92],
  [16, 87],
  [17, 86],
  [19, 92],
  [20, 93],
  [21, 92],
  [22, 94],
  [23, 89],
  [24, 91],
  [25, 89],
  [26, 89],
  [27, 89],
]) as Theme

export const light_yellow_active = n28 as Theme
const n29 = t([
  [0, 37],
  [1, 38],
  [2, 39],
  [3, 40],
  [4, 41],
  [5, 43],
  [6, 44],
  [7, 45],
  [8, 46],
  [9, 47],
  [10, 11],
  [11, 11],
  [12, 38],
  [13, 39],
  [14, 40],
  [15, 41],
  [16, 37],
  [17, 36],
  [18, 47],
  [19, 46],
  [20, 47],
  [21, 46],
  [22, 11],
  [23, 40],
  [24, 41],
  [25, 40],
  [26, 40],
  [27, 44],
]) as Theme

export const light_green_alt1 = n29 as Theme
const n30 = t([
  [0, 38],
  [1, 39],
  [2, 40],
  [3, 41],
  [4, 43],
  [5, 44],
  [6, 45],
  [7, 46],
  [8, 47],
  [9, 11],
  [10, 11],
  [11, 11],
  [12, 39],
  [13, 40],
  [14, 41],
  [15, 43],
  [16, 38],
  [17, 37],
  [18, 46],
  [19, 45],
  [20, 46],
  [21, 45],
  [22, 47],
  [23, 40],
  [24, 41],
  [25, 40],
  [26, 40],
  [27, 43],
]) as Theme

export const light_green_alt2 = n30 as Theme
const n31 = t([
  [0, 39],
  [1, 40],
  [2, 41],
  [3, 43],
  [4, 44],
  [5, 45],
  [6, 46],
  [7, 47],
  [8, 11],
  [9, 193],
  [10, 193],
  [11, 193],
  [12, 40],
  [13, 41],
  [14, 43],
  [15, 44],
  [16, 39],
  [17, 38],
  [19, 44],
  [20, 45],
  [21, 44],
  [22, 46],
  [23, 41],
  [24, 43],
  [25, 41],
  [26, 41],
  [27, 41],
]) as Theme

export const light_green_active = n31 as Theme
const n32 = t([
  [0, 15],
  [1, 16],
  [2, 17],
  [3, 18],
  [4, 19],
  [5, 21],
  [6, 22],
  [7, 23],
  [8, 24],
  [9, 25],
  [10, 11],
  [11, 11],
  [12, 16],
  [13, 17],
  [14, 18],
  [15, 19],
  [16, 15],
  [17, 14],
  [18, 25],
  [19, 24],
  [20, 25],
  [21, 24],
  [22, 11],
  [23, 18],
  [24, 19],
  [25, 18],
  [26, 18],
  [27, 22],
]) as Theme

export const light_blue_alt1 = n32 as Theme
const n33 = t([
  [0, 16],
  [1, 17],
  [2, 18],
  [3, 19],
  [4, 21],
  [5, 22],
  [6, 23],
  [7, 24],
  [8, 25],
  [9, 11],
  [10, 11],
  [11, 11],
  [12, 17],
  [13, 18],
  [14, 19],
  [15, 21],
  [16, 16],
  [17, 15],
  [18, 24],
  [19, 23],
  [20, 24],
  [21, 23],
  [22, 25],
  [23, 18],
  [24, 19],
  [25, 18],
  [26, 18],
  [27, 21],
]) as Theme

export const light_blue_alt2 = n33 as Theme
const n34 = t([
  [0, 17],
  [1, 18],
  [2, 19],
  [3, 21],
  [4, 22],
  [5, 23],
  [6, 24],
  [7, 25],
  [8, 11],
  [9, 195],
  [10, 195],
  [11, 195],
  [12, 18],
  [13, 19],
  [14, 21],
  [15, 22],
  [16, 17],
  [17, 16],
  [19, 22],
  [20, 23],
  [21, 22],
  [22, 24],
  [23, 19],
  [24, 21],
  [25, 19],
  [26, 19],
  [27, 19],
]) as Theme

export const light_blue_active = n34 as Theme
const n35 = t([
  [0, 61],
  [1, 62],
  [2, 63],
  [3, 64],
  [4, 65],
  [5, 67],
  [6, 68],
  [7, 69],
  [8, 70],
  [9, 71],
  [10, 11],
  [11, 11],
  [12, 62],
  [13, 63],
  [14, 64],
  [15, 65],
  [16, 61],
  [17, 60],
  [18, 71],
  [19, 70],
  [20, 71],
  [21, 70],
  [22, 11],
  [23, 64],
  [24, 65],
  [25, 64],
  [26, 64],
  [27, 68],
]) as Theme

export const light_mint_alt1 = n35 as Theme
const n36 = t([
  [0, 62],
  [1, 63],
  [2, 64],
  [3, 65],
  [4, 67],
  [5, 68],
  [6, 69],
  [7, 70],
  [8, 71],
  [9, 11],
  [10, 11],
  [11, 11],
  [12, 63],
  [13, 64],
  [14, 65],
  [15, 67],
  [16, 62],
  [17, 61],
  [18, 70],
  [19, 69],
  [20, 70],
  [21, 69],
  [22, 71],
  [23, 64],
  [24, 65],
  [25, 64],
  [26, 64],
  [27, 67],
]) as Theme

export const light_mint_alt2 = n36 as Theme
const n37 = t([
  [0, 63],
  [1, 64],
  [2, 65],
  [3, 67],
  [4, 68],
  [5, 69],
  [6, 70],
  [7, 71],
  [8, 11],
  [9, 197],
  [10, 197],
  [11, 197],
  [12, 64],
  [13, 65],
  [14, 67],
  [15, 68],
  [16, 63],
  [17, 62],
  [19, 68],
  [20, 69],
  [21, 68],
  [22, 70],
  [23, 65],
  [24, 67],
  [25, 65],
  [26, 65],
  [27, 65],
]) as Theme

export const light_mint_active = n37 as Theme
const n38 = t([
  [0, 73],
  [1, 74],
  [2, 75],
  [3, 76],
  [4, 77],
  [5, 79],
  [6, 80],
  [7, 81],
  [8, 82],
  [9, 83],
  [10, 11],
  [11, 11],
  [12, 74],
  [13, 75],
  [14, 76],
  [15, 77],
  [16, 73],
  [17, 72],
  [18, 83],
  [19, 82],
  [20, 83],
  [21, 82],
  [22, 11],
  [23, 76],
  [24, 77],
  [25, 76],
  [26, 76],
  [27, 80],
]) as Theme

export const light_red_alt1 = n38 as Theme
const n39 = t([
  [0, 74],
  [1, 75],
  [2, 76],
  [3, 77],
  [4, 79],
  [5, 80],
  [6, 81],
  [7, 82],
  [8, 83],
  [9, 11],
  [10, 11],
  [11, 11],
  [12, 75],
  [13, 76],
  [14, 77],
  [15, 79],
  [16, 74],
  [17, 73],
  [18, 82],
  [19, 81],
  [20, 82],
  [21, 81],
  [22, 83],
  [23, 76],
  [24, 77],
  [25, 76],
  [26, 76],
  [27, 79],
]) as Theme

export const light_red_alt2 = n39 as Theme
const n40 = t([
  [0, 75],
  [1, 76],
  [2, 77],
  [3, 79],
  [4, 80],
  [5, 81],
  [6, 82],
  [7, 83],
  [8, 11],
  [9, 199],
  [10, 199],
  [11, 199],
  [12, 76],
  [13, 77],
  [14, 79],
  [15, 80],
  [16, 75],
  [17, 74],
  [19, 80],
  [20, 81],
  [21, 80],
  [22, 82],
  [23, 77],
  [24, 79],
  [25, 77],
  [26, 77],
  [27, 77],
]) as Theme

export const light_red_active = n40 as Theme
const n41 = t([
  [0, 143],
  [1, 144],
  [2, 145],
  [3, 146],
  [4, 147],
  [5, 149],
  [6, 56],
  [7, 150],
  [8, 151],
  [9, 152],
  [10, 0],
  [11, 0],
  [12, 144],
  [13, 145],
  [14, 146],
  [15, 147],
  [16, 143],
  [17, 142],
  [18, 152],
  [19, 151],
  [20, 152],
  [21, 151],
  [22, 0],
  [23, 147],
  [24, 149],
  [25, 146],
  [26, 147],
  [27, 56],
]) as Theme

export const dark_orange_alt1 = n41 as Theme
export const dark_orange_alt1_ListItem = n41 as Theme
const n42 = t([
  [0, 144],
  [1, 145],
  [2, 146],
  [3, 147],
  [4, 149],
  [5, 56],
  [6, 150],
  [7, 151],
  [8, 152],
  [9, 0],
  [10, 0],
  [11, 0],
  [12, 145],
  [13, 146],
  [14, 147],
  [15, 149],
  [16, 144],
  [17, 143],
  [18, 151],
  [19, 150],
  [20, 151],
  [21, 150],
  [22, 152],
  [23, 147],
  [24, 149],
  [25, 146],
  [26, 147],
  [27, 149],
]) as Theme

export const dark_orange_alt2 = n42 as Theme
export const dark_orange_alt2_ListItem = n42 as Theme
const n43 = t([
  [0, 145],
  [1, 146],
  [2, 147],
  [3, 149],
  [4, 56],
  [5, 150],
  [6, 151],
  [7, 152],
  [8, 0],
  [9, 201],
  [10, 201],
  [11, 201],
  [12, 146],
  [13, 147],
  [14, 149],
  [15, 56],
  [16, 145],
  [17, 144],
  [19, 56],
  [20, 150],
  [21, 56],
  [22, 151],
  [23, 149],
  [24, 56],
  [25, 147],
  [26, 149],
  [27, 147],
]) as Theme

export const dark_orange_active = n43 as Theme
export const dark_orange_active_ListItem = n43 as Theme
const n44 = t([
  [0, 176],
  [1, 177],
  [2, 178],
  [3, 179],
  [4, 180],
  [5, 182],
  [6, 92],
  [7, 183],
  [8, 184],
  [9, 185],
  [10, 0],
  [11, 0],
  [12, 177],
  [13, 178],
  [14, 179],
  [15, 180],
  [16, 176],
  [17, 175],
  [18, 185],
  [19, 184],
  [20, 185],
  [21, 184],
  [22, 0],
  [23, 180],
  [24, 182],
  [25, 179],
  [26, 180],
  [27, 92],
]) as Theme

export const dark_yellow_alt1 = n44 as Theme
export const dark_yellow_alt1_ListItem = n44 as Theme
const n45 = t([
  [0, 177],
  [1, 178],
  [2, 179],
  [3, 180],
  [4, 182],
  [5, 92],
  [6, 183],
  [7, 184],
  [8, 185],
  [9, 0],
  [10, 0],
  [11, 0],
  [12, 178],
  [13, 179],
  [14, 180],
  [15, 182],
  [16, 177],
  [17, 176],
  [18, 184],
  [19, 183],
  [20, 184],
  [21, 183],
  [22, 185],
  [23, 180],
  [24, 182],
  [25, 179],
  [26, 180],
  [27, 182],
]) as Theme

export const dark_yellow_alt2 = n45 as Theme
export const dark_yellow_alt2_ListItem = n45 as Theme
const n46 = t([
  [0, 178],
  [1, 179],
  [2, 180],
  [3, 182],
  [4, 92],
  [5, 183],
  [6, 184],
  [7, 185],
  [8, 0],
  [9, 203],
  [10, 203],
  [11, 203],
  [12, 179],
  [13, 180],
  [14, 182],
  [15, 92],
  [16, 178],
  [17, 177],
  [19, 92],
  [20, 183],
  [21, 92],
  [22, 184],
  [23, 182],
  [24, 92],
  [25, 180],
  [26, 182],
  [27, 180],
]) as Theme

export const dark_yellow_active = n46 as Theme
export const dark_yellow_active_ListItem = n46 as Theme
const n47 = t([
  [0, 132],
  [1, 133],
  [2, 134],
  [3, 135],
  [4, 136],
  [5, 138],
  [6, 44],
  [7, 139],
  [8, 140],
  [9, 141],
  [10, 0],
  [11, 0],
  [12, 133],
  [13, 134],
  [14, 135],
  [15, 136],
  [16, 132],
  [17, 131],
  [18, 141],
  [19, 140],
  [20, 141],
  [21, 140],
  [22, 0],
  [23, 136],
  [24, 138],
  [25, 135],
  [26, 136],
  [27, 44],
]) as Theme

export const dark_green_alt1 = n47 as Theme
export const dark_green_alt1_ListItem = n47 as Theme
const n48 = t([
  [0, 133],
  [1, 134],
  [2, 135],
  [3, 136],
  [4, 138],
  [5, 44],
  [6, 139],
  [7, 140],
  [8, 141],
  [9, 0],
  [10, 0],
  [11, 0],
  [12, 134],
  [13, 135],
  [14, 136],
  [15, 138],
  [16, 133],
  [17, 132],
  [18, 140],
  [19, 139],
  [20, 140],
  [21, 139],
  [22, 141],
  [23, 136],
  [24, 138],
  [25, 135],
  [26, 136],
  [27, 138],
]) as Theme

export const dark_green_alt2 = n48 as Theme
export const dark_green_alt2_ListItem = n48 as Theme
const n49 = t([
  [0, 134],
  [1, 135],
  [2, 136],
  [3, 138],
  [4, 44],
  [5, 139],
  [6, 140],
  [7, 141],
  [8, 0],
  [9, 205],
  [10, 205],
  [11, 205],
  [12, 135],
  [13, 136],
  [14, 138],
  [15, 44],
  [16, 134],
  [17, 133],
  [19, 44],
  [20, 139],
  [21, 44],
  [22, 140],
  [23, 138],
  [24, 44],
  [25, 136],
  [26, 138],
  [27, 136],
]) as Theme

export const dark_green_active = n49 as Theme
export const dark_green_active_ListItem = n49 as Theme
const n50 = t([
  [0, 110],
  [1, 111],
  [2, 112],
  [3, 113],
  [4, 114],
  [5, 116],
  [6, 22],
  [7, 117],
  [8, 118],
  [9, 119],
  [10, 0],
  [11, 0],
  [12, 111],
  [13, 112],
  [14, 113],
  [15, 114],
  [16, 110],
  [17, 109],
  [18, 119],
  [19, 118],
  [20, 119],
  [21, 118],
  [22, 0],
  [23, 114],
  [24, 116],
  [25, 113],
  [26, 114],
  [27, 22],
]) as Theme

export const dark_blue_alt1 = n50 as Theme
export const dark_blue_alt1_ListItem = n50 as Theme
const n51 = t([
  [0, 111],
  [1, 112],
  [2, 113],
  [3, 114],
  [4, 116],
  [5, 22],
  [6, 117],
  [7, 118],
  [8, 119],
  [9, 0],
  [10, 0],
  [11, 0],
  [12, 112],
  [13, 113],
  [14, 114],
  [15, 116],
  [16, 111],
  [17, 110],
  [18, 118],
  [19, 117],
  [20, 118],
  [21, 117],
  [22, 119],
  [23, 114],
  [24, 116],
  [25, 113],
  [26, 114],
  [27, 116],
]) as Theme

export const dark_blue_alt2 = n51 as Theme
export const dark_blue_alt2_ListItem = n51 as Theme
const n52 = t([
  [0, 112],
  [1, 113],
  [2, 114],
  [3, 116],
  [4, 22],
  [5, 117],
  [6, 118],
  [7, 119],
  [8, 0],
  [9, 207],
  [10, 207],
  [11, 207],
  [12, 113],
  [13, 114],
  [14, 116],
  [15, 22],
  [16, 112],
  [17, 111],
  [19, 22],
  [20, 117],
  [21, 22],
  [22, 118],
  [23, 116],
  [24, 22],
  [25, 114],
  [26, 116],
  [27, 114],
]) as Theme

export const dark_blue_active = n52 as Theme
export const dark_blue_active_ListItem = n52 as Theme
const n53 = t([
  [0, 154],
  [1, 155],
  [2, 156],
  [3, 157],
  [4, 158],
  [5, 160],
  [6, 68],
  [7, 161],
  [8, 162],
  [9, 163],
  [10, 0],
  [11, 0],
  [12, 155],
  [13, 156],
  [14, 157],
  [15, 158],
  [16, 154],
  [17, 153],
  [18, 163],
  [19, 162],
  [20, 163],
  [21, 162],
  [22, 0],
  [23, 158],
  [24, 160],
  [25, 157],
  [26, 158],
  [27, 68],
]) as Theme

export const dark_mint_alt1 = n53 as Theme
export const dark_mint_alt1_ListItem = n53 as Theme
const n54 = t([
  [0, 155],
  [1, 156],
  [2, 157],
  [3, 158],
  [4, 160],
  [5, 68],
  [6, 161],
  [7, 162],
  [8, 163],
  [9, 0],
  [10, 0],
  [11, 0],
  [12, 156],
  [13, 157],
  [14, 158],
  [15, 160],
  [16, 155],
  [17, 154],
  [18, 162],
  [19, 161],
  [20, 162],
  [21, 161],
  [22, 163],
  [23, 158],
  [24, 160],
  [25, 157],
  [26, 158],
  [27, 160],
]) as Theme

export const dark_mint_alt2 = n54 as Theme
export const dark_mint_alt2_ListItem = n54 as Theme
const n55 = t([
  [0, 156],
  [1, 157],
  [2, 158],
  [3, 160],
  [4, 68],
  [5, 161],
  [6, 162],
  [7, 163],
  [8, 0],
  [9, 209],
  [10, 209],
  [11, 209],
  [12, 157],
  [13, 158],
  [14, 160],
  [15, 68],
  [16, 156],
  [17, 155],
  [19, 68],
  [20, 161],
  [21, 68],
  [22, 162],
  [23, 160],
  [24, 68],
  [25, 158],
  [26, 160],
  [27, 158],
]) as Theme

export const dark_mint_active = n55 as Theme
export const dark_mint_active_ListItem = n55 as Theme
const n56 = t([
  [0, 165],
  [1, 166],
  [2, 167],
  [3, 168],
  [4, 169],
  [5, 171],
  [6, 80],
  [7, 172],
  [8, 173],
  [9, 174],
  [10, 0],
  [11, 0],
  [12, 166],
  [13, 167],
  [14, 168],
  [15, 169],
  [16, 165],
  [17, 164],
  [18, 174],
  [19, 173],
  [20, 174],
  [21, 173],
  [22, 0],
  [23, 169],
  [24, 171],
  [25, 168],
  [26, 169],
  [27, 80],
]) as Theme

export const dark_red_alt1 = n56 as Theme
export const dark_red_alt1_ListItem = n56 as Theme
const n57 = t([
  [0, 166],
  [1, 167],
  [2, 168],
  [3, 169],
  [4, 171],
  [5, 80],
  [6, 172],
  [7, 173],
  [8, 174],
  [9, 0],
  [10, 0],
  [11, 0],
  [12, 167],
  [13, 168],
  [14, 169],
  [15, 171],
  [16, 166],
  [17, 165],
  [18, 173],
  [19, 172],
  [20, 173],
  [21, 172],
  [22, 174],
  [23, 169],
  [24, 171],
  [25, 168],
  [26, 169],
  [27, 171],
]) as Theme

export const dark_red_alt2 = n57 as Theme
export const dark_red_alt2_ListItem = n57 as Theme
const n58 = t([
  [0, 167],
  [1, 168],
  [2, 169],
  [3, 171],
  [4, 80],
  [5, 172],
  [6, 173],
  [7, 174],
  [8, 0],
  [9, 211],
  [10, 211],
  [11, 211],
  [12, 168],
  [13, 169],
  [14, 171],
  [15, 80],
  [16, 167],
  [17, 166],
  [19, 80],
  [20, 172],
  [21, 80],
  [22, 173],
  [23, 171],
  [24, 80],
  [25, 169],
  [26, 171],
  [27, 169],
]) as Theme

export const dark_red_active = n58 as Theme
export const dark_red_active_ListItem = n58 as Theme
const n59 = t([
  [12, 0],
  [13, 1],
  [14, 2],
  [15, 3],
  [16, 0],
  [17, 0],
  [18, 11],
  [19, 10],
  [20, 11],
  [21, 10],
  [22, 11],
  [23, 3],
  [24, 4],
  [25, 2],
  [26, 3],
  [27, 9],
]) as Theme

export const light_ListItem = n59 as Theme
const n60 = t([
  [12, 2],
  [13, 3],
  [14, 4],
  [15, 5],
  [16, 1],
  [17, 0],
  [18, 11],
  [19, 10],
  [20, 11],
  [21, 10],
  [22, 11],
  [23, 5],
  [24, 6],
  [25, 4],
  [26, 5],
  [27, 7],
]) as Theme

export const light_Card = n60 as Theme
export const light_DrawerFrame = n60 as Theme
export const light_Progress = n60 as Theme
export const light_TooltipArrow = n60 as Theme
const n61 = t([
  [12, 3],
  [13, 4],
  [14, 5],
  [15, 6],
  [16, 2],
  [17, 1],
  [18, 11],
  [19, 10],
  [20, 11],
  [21, 10],
  [22, 10],
  [23, 5],
  [24, 6],
  [25, 4],
  [26, 5],
  [27, 6],
]) as Theme

export const light_Button = n61 as Theme
export const light_Switch = n61 as Theme
export const light_TooltipContent = n61 as Theme
export const light_SliderTrack = n61 as Theme
const n62 = t([
  [12, 1],
  [13, 2],
  [14, 3],
  [15, 4],
  [16, 0],
  [17, 12],
  [18, 11],
  [19, 10],
  [20, 11],
  [21, 10],
  [22, 13],
  [23, 6],
  [24, 7],
  [25, 5],
  [26, 6],
  [27, 8],
]) as Theme

export const light_Checkbox = n62 as Theme
export const light_RadioGroupItem = n62 as Theme
export const light_Input = n62 as Theme
export const light_TextArea = n62 as Theme
const n63 = t([
  [12, 11],
  [13, 11],
  [14, 10],
  [15, 9],
  [16, 11],
  [17, 11],
  [18, 0],
  [19, 1],
  [20, 0],
  [21, 1],
  [22, 0],
  [23, 9],
  [24, 8],
  [25, 10],
  [26, 9],
  [27, 1],
]) as Theme

export const light_SwitchThumb = n63 as Theme
const n64 = t([
  [12, 8],
  [13, 7],
  [14, 6],
  [15, 5],
  [16, 9],
  [17, 10],
  [18, 0],
  [19, 1],
  [20, 0],
  [21, 1],
  [22, 1],
  [23, 5],
  [24, 4],
  [25, 6],
  [26, 5],
  [27, 5],
]) as Theme

export const light_SliderTrackActive = n64 as Theme
const n65 = t([
  [12, 10],
  [13, 9],
  [14, 8],
  [15, 7],
  [16, 11],
  [17, 13],
  [18, 0],
  [19, 1],
  [20, 0],
  [21, 1],
  [22, 12],
  [23, 7],
  [24, 6],
  [25, 8],
  [26, 7],
  [27, 3],
]) as Theme

export const light_SliderThumb = n65 as Theme
export const light_Tooltip = n65 as Theme
export const light_ProgressIndicator = n65 as Theme
const n66 = t([
  [0, 98],
  [1, 99],
  [2, 100],
  [3, 101],
  [4, 102],
  [5, 103],
  [6, 104],
  [7, 105],
  [8, 106],
  [9, 107],
  [10, 108],
  [11, 0],
  [12, 99],
  [13, 100],
  [14, 101],
  [15, 102],
  [16, 98],
  [17, 13],
  [18, 0],
  [19, 108],
  [20, 0],
  [21, 108],
  [22, 12],
  [23, 102],
  [24, 103],
  [25, 101],
  [26, 102],
  [27, 106],
]) as Theme

export const dark_ListItem = n66 as Theme
const n67 = t([
  [12, 100],
  [13, 101],
  [14, 102],
  [15, 103],
  [16, 99],
  [17, 98],
  [18, 0],
  [19, 108],
  [20, 0],
  [21, 108],
  [22, 0],
  [23, 103],
  [24, 104],
  [25, 102],
  [26, 103],
  [27, 105],
]) as Theme

export const dark_Card = n67 as Theme
export const dark_DrawerFrame = n67 as Theme
export const dark_Progress = n67 as Theme
export const dark_TooltipArrow = n67 as Theme
const n68 = t([
  [12, 101],
  [13, 102],
  [14, 103],
  [15, 104],
  [16, 100],
  [17, 99],
  [18, 0],
  [19, 108],
  [20, 0],
  [21, 108],
  [22, 108],
  [23, 103],
  [24, 104],
  [25, 102],
  [26, 103],
  [27, 104],
]) as Theme

export const dark_Button = n68 as Theme
export const dark_Switch = n68 as Theme
export const dark_TooltipContent = n68 as Theme
export const dark_SliderTrack = n68 as Theme
const n69 = t([
  [12, 99],
  [13, 100],
  [14, 101],
  [15, 102],
  [16, 98],
  [17, 13],
  [18, 0],
  [19, 108],
  [20, 0],
  [21, 108],
  [22, 12],
  [23, 104],
  [24, 105],
  [25, 103],
  [26, 104],
  [27, 106],
]) as Theme

export const dark_Checkbox = n69 as Theme
export const dark_RadioGroupItem = n69 as Theme
export const dark_Input = n69 as Theme
export const dark_TextArea = n69 as Theme
const n70 = t([
  [12, 0],
  [13, 0],
  [14, 108],
  [15, 107],
  [16, 0],
  [17, 0],
  [18, 98],
  [19, 99],
  [20, 98],
  [21, 99],
  [22, 98],
  [23, 107],
  [24, 106],
  [25, 108],
  [26, 107],
  [27, 99],
]) as Theme

export const dark_SwitchThumb = n70 as Theme
const n71 = t([
  [12, 106],
  [13, 105],
  [14, 104],
  [15, 103],
  [16, 107],
  [17, 108],
  [18, 98],
  [19, 99],
  [20, 98],
  [21, 99],
  [22, 99],
  [23, 103],
  [24, 102],
  [25, 104],
  [26, 103],
  [27, 103],
]) as Theme

export const dark_SliderTrackActive = n71 as Theme
const n72 = t([
  [12, 108],
  [13, 107],
  [14, 106],
  [15, 105],
  [16, 0],
  [17, 12],
  [18, 98],
  [19, 99],
  [20, 98],
  [21, 99],
  [22, 13],
  [23, 105],
  [24, 104],
  [25, 106],
  [26, 105],
  [27, 101],
]) as Theme

export const dark_SliderThumb = n72 as Theme
export const dark_Tooltip = n72 as Theme
export const dark_ProgressIndicator = n72 as Theme
const n73 = t([
  [12, 48],
  [13, 49],
  [14, 50],
  [15, 51],
  [16, 48],
  [17, 48],
  [18, 11],
  [19, 59],
  [20, 11],
  [21, 59],
  [22, 11],
  [23, 50],
  [24, 51],
  [25, 50],
  [26, 50],
  [27, 58],
]) as Theme

export const light_orange_ListItem = n73 as Theme
const n74 = t([
  [12, 50],
  [13, 51],
  [14, 52],
  [15, 53],
  [16, 49],
  [17, 48],
  [18, 11],
  [19, 59],
  [20, 11],
  [21, 59],
  [22, 11],
  [23, 52],
  [24, 53],
  [25, 52],
  [26, 52],
  [27, 56],
]) as Theme

export const light_orange_Card = n74 as Theme
export const light_orange_DrawerFrame = n74 as Theme
export const light_orange_Progress = n74 as Theme
export const light_orange_TooltipArrow = n74 as Theme
const n75 = t([
  [12, 51],
  [13, 52],
  [14, 53],
  [15, 55],
  [16, 50],
  [17, 49],
  [18, 11],
  [19, 59],
  [20, 11],
  [21, 59],
  [22, 59],
  [23, 52],
  [24, 53],
  [25, 52],
  [26, 52],
  [27, 55],
]) as Theme

export const light_orange_Button = n75 as Theme
export const light_orange_Switch = n75 as Theme
export const light_orange_TooltipContent = n75 as Theme
export const light_orange_SliderTrack = n75 as Theme
const n76 = t([
  [12, 49],
  [13, 50],
  [14, 51],
  [15, 52],
  [16, 48],
  [17, 188],
  [18, 11],
  [19, 59],
  [20, 11],
  [21, 59],
  [22, 189],
  [23, 53],
  [24, 55],
  [25, 53],
  [26, 53],
  [27, 57],
]) as Theme

export const light_orange_Checkbox = n76 as Theme
export const light_orange_RadioGroupItem = n76 as Theme
export const light_orange_Input = n76 as Theme
export const light_orange_TextArea = n76 as Theme
const n77 = t([
  [12, 11],
  [13, 11],
  [14, 59],
  [15, 58],
  [16, 11],
  [17, 11],
  [18, 48],
  [19, 49],
  [20, 48],
  [21, 49],
  [22, 48],
  [23, 59],
  [24, 58],
  [25, 59],
  [26, 59],
  [27, 49],
]) as Theme

export const light_orange_SwitchThumb = n77 as Theme
const n78 = t([
  [12, 57],
  [13, 56],
  [14, 55],
  [15, 53],
  [16, 58],
  [17, 59],
  [18, 48],
  [19, 49],
  [20, 48],
  [21, 49],
  [22, 49],
  [23, 55],
  [24, 53],
  [25, 55],
  [26, 55],
  [27, 53],
]) as Theme

export const light_orange_SliderTrackActive = n78 as Theme
const n79 = t([
  [12, 59],
  [13, 58],
  [14, 57],
  [15, 56],
  [16, 11],
  [17, 189],
  [18, 48],
  [19, 49],
  [20, 48],
  [21, 49],
  [22, 188],
  [23, 57],
  [24, 56],
  [25, 57],
  [26, 57],
  [27, 51],
]) as Theme

export const light_orange_SliderThumb = n79 as Theme
export const light_orange_Tooltip = n79 as Theme
export const light_orange_ProgressIndicator = n79 as Theme
const n80 = t([
  [12, 84],
  [13, 85],
  [14, 86],
  [15, 87],
  [16, 84],
  [17, 84],
  [18, 11],
  [19, 95],
  [20, 11],
  [21, 95],
  [22, 11],
  [23, 86],
  [24, 87],
  [25, 86],
  [26, 86],
  [27, 94],
]) as Theme

export const light_yellow_ListItem = n80 as Theme
const n81 = t([
  [12, 86],
  [13, 87],
  [14, 88],
  [15, 89],
  [16, 85],
  [17, 84],
  [18, 11],
  [19, 95],
  [20, 11],
  [21, 95],
  [22, 11],
  [23, 88],
  [24, 89],
  [25, 88],
  [26, 88],
  [27, 92],
]) as Theme

export const light_yellow_Card = n81 as Theme
export const light_yellow_DrawerFrame = n81 as Theme
export const light_yellow_Progress = n81 as Theme
export const light_yellow_TooltipArrow = n81 as Theme
const n82 = t([
  [12, 87],
  [13, 88],
  [14, 89],
  [15, 91],
  [16, 86],
  [17, 85],
  [18, 11],
  [19, 95],
  [20, 11],
  [21, 95],
  [22, 95],
  [23, 88],
  [24, 89],
  [25, 88],
  [26, 88],
  [27, 91],
]) as Theme

export const light_yellow_Button = n82 as Theme
export const light_yellow_Switch = n82 as Theme
export const light_yellow_TooltipContent = n82 as Theme
export const light_yellow_SliderTrack = n82 as Theme
const n83 = t([
  [12, 85],
  [13, 86],
  [14, 87],
  [15, 88],
  [16, 84],
  [17, 190],
  [18, 11],
  [19, 95],
  [20, 11],
  [21, 95],
  [22, 191],
  [23, 89],
  [24, 91],
  [25, 89],
  [26, 89],
  [27, 93],
]) as Theme

export const light_yellow_Checkbox = n83 as Theme
export const light_yellow_RadioGroupItem = n83 as Theme
export const light_yellow_Input = n83 as Theme
export const light_yellow_TextArea = n83 as Theme
const n84 = t([
  [12, 11],
  [13, 11],
  [14, 95],
  [15, 94],
  [16, 11],
  [17, 11],
  [18, 84],
  [19, 85],
  [20, 84],
  [21, 85],
  [22, 84],
  [23, 95],
  [24, 94],
  [25, 95],
  [26, 95],
  [27, 85],
]) as Theme

export const light_yellow_SwitchThumb = n84 as Theme
const n85 = t([
  [12, 93],
  [13, 92],
  [14, 91],
  [15, 89],
  [16, 94],
  [17, 95],
  [18, 84],
  [19, 85],
  [20, 84],
  [21, 85],
  [22, 85],
  [23, 91],
  [24, 89],
  [25, 91],
  [26, 91],
  [27, 89],
]) as Theme

export const light_yellow_SliderTrackActive = n85 as Theme
const n86 = t([
  [12, 95],
  [13, 94],
  [14, 93],
  [15, 92],
  [16, 11],
  [17, 191],
  [18, 84],
  [19, 85],
  [20, 84],
  [21, 85],
  [22, 190],
  [23, 93],
  [24, 92],
  [25, 93],
  [26, 93],
  [27, 87],
]) as Theme

export const light_yellow_SliderThumb = n86 as Theme
export const light_yellow_Tooltip = n86 as Theme
export const light_yellow_ProgressIndicator = n86 as Theme
const n87 = t([
  [12, 36],
  [13, 37],
  [14, 38],
  [15, 39],
  [16, 36],
  [17, 36],
  [18, 11],
  [19, 47],
  [20, 11],
  [21, 47],
  [22, 11],
  [23, 38],
  [24, 39],
  [25, 38],
  [26, 38],
  [27, 46],
]) as Theme

export const light_green_ListItem = n87 as Theme
const n88 = t([
  [12, 38],
  [13, 39],
  [14, 40],
  [15, 41],
  [16, 37],
  [17, 36],
  [18, 11],
  [19, 47],
  [20, 11],
  [21, 47],
  [22, 11],
  [23, 40],
  [24, 41],
  [25, 40],
  [26, 40],
  [27, 44],
]) as Theme

export const light_green_Card = n88 as Theme
export const light_green_DrawerFrame = n88 as Theme
export const light_green_Progress = n88 as Theme
export const light_green_TooltipArrow = n88 as Theme
const n89 = t([
  [12, 39],
  [13, 40],
  [14, 41],
  [15, 43],
  [16, 38],
  [17, 37],
  [18, 11],
  [19, 47],
  [20, 11],
  [21, 47],
  [22, 47],
  [23, 40],
  [24, 41],
  [25, 40],
  [26, 40],
  [27, 43],
]) as Theme

export const light_green_Button = n89 as Theme
export const light_green_Switch = n89 as Theme
export const light_green_TooltipContent = n89 as Theme
export const light_green_SliderTrack = n89 as Theme
const n90 = t([
  [12, 37],
  [13, 38],
  [14, 39],
  [15, 40],
  [16, 36],
  [17, 192],
  [18, 11],
  [19, 47],
  [20, 11],
  [21, 47],
  [22, 193],
  [23, 41],
  [24, 43],
  [25, 41],
  [26, 41],
  [27, 45],
]) as Theme

export const light_green_Checkbox = n90 as Theme
export const light_green_RadioGroupItem = n90 as Theme
export const light_green_Input = n90 as Theme
export const light_green_TextArea = n90 as Theme
const n91 = t([
  [12, 11],
  [13, 11],
  [14, 47],
  [15, 46],
  [16, 11],
  [17, 11],
  [18, 36],
  [19, 37],
  [20, 36],
  [21, 37],
  [22, 36],
  [23, 47],
  [24, 46],
  [25, 47],
  [26, 47],
  [27, 37],
]) as Theme

export const light_green_SwitchThumb = n91 as Theme
const n92 = t([
  [12, 45],
  [13, 44],
  [14, 43],
  [15, 41],
  [16, 46],
  [17, 47],
  [18, 36],
  [19, 37],
  [20, 36],
  [21, 37],
  [22, 37],
  [23, 43],
  [24, 41],
  [25, 43],
  [26, 43],
  [27, 41],
]) as Theme

export const light_green_SliderTrackActive = n92 as Theme
const n93 = t([
  [12, 47],
  [13, 46],
  [14, 45],
  [15, 44],
  [16, 11],
  [17, 193],
  [18, 36],
  [19, 37],
  [20, 36],
  [21, 37],
  [22, 192],
  [23, 45],
  [24, 44],
  [25, 45],
  [26, 45],
  [27, 39],
]) as Theme

export const light_green_SliderThumb = n93 as Theme
export const light_green_Tooltip = n93 as Theme
export const light_green_ProgressIndicator = n93 as Theme
const n94 = t([
  [12, 14],
  [13, 15],
  [14, 16],
  [15, 17],
  [16, 14],
  [17, 14],
  [18, 11],
  [19, 25],
  [20, 11],
  [21, 25],
  [22, 11],
  [23, 16],
  [24, 17],
  [25, 16],
  [26, 16],
  [27, 24],
]) as Theme

export const light_blue_ListItem = n94 as Theme
const n95 = t([
  [12, 16],
  [13, 17],
  [14, 18],
  [15, 19],
  [16, 15],
  [17, 14],
  [18, 11],
  [19, 25],
  [20, 11],
  [21, 25],
  [22, 11],
  [23, 18],
  [24, 19],
  [25, 18],
  [26, 18],
  [27, 22],
]) as Theme

export const light_blue_Card = n95 as Theme
export const light_blue_DrawerFrame = n95 as Theme
export const light_blue_Progress = n95 as Theme
export const light_blue_TooltipArrow = n95 as Theme
const n96 = t([
  [12, 17],
  [13, 18],
  [14, 19],
  [15, 21],
  [16, 16],
  [17, 15],
  [18, 11],
  [19, 25],
  [20, 11],
  [21, 25],
  [22, 25],
  [23, 18],
  [24, 19],
  [25, 18],
  [26, 18],
  [27, 21],
]) as Theme

export const light_blue_Button = n96 as Theme
export const light_blue_Switch = n96 as Theme
export const light_blue_TooltipContent = n96 as Theme
export const light_blue_SliderTrack = n96 as Theme
const n97 = t([
  [12, 15],
  [13, 16],
  [14, 17],
  [15, 18],
  [16, 14],
  [17, 194],
  [18, 11],
  [19, 25],
  [20, 11],
  [21, 25],
  [22, 195],
  [23, 19],
  [24, 21],
  [25, 19],
  [26, 19],
  [27, 23],
]) as Theme

export const light_blue_Checkbox = n97 as Theme
export const light_blue_RadioGroupItem = n97 as Theme
export const light_blue_Input = n97 as Theme
export const light_blue_TextArea = n97 as Theme
const n98 = t([
  [12, 11],
  [13, 11],
  [14, 25],
  [15, 24],
  [16, 11],
  [17, 11],
  [18, 14],
  [19, 15],
  [20, 14],
  [21, 15],
  [22, 14],
  [23, 25],
  [24, 24],
  [25, 25],
  [26, 25],
  [27, 15],
]) as Theme

export const light_blue_SwitchThumb = n98 as Theme
const n99 = t([
  [12, 23],
  [13, 22],
  [14, 21],
  [15, 19],
  [16, 24],
  [17, 25],
  [18, 14],
  [19, 15],
  [20, 14],
  [21, 15],
  [22, 15],
  [23, 21],
  [24, 19],
  [25, 21],
  [26, 21],
  [27, 19],
]) as Theme

export const light_blue_SliderTrackActive = n99 as Theme
const n100 = t([
  [12, 25],
  [13, 24],
  [14, 23],
  [15, 22],
  [16, 11],
  [17, 195],
  [18, 14],
  [19, 15],
  [20, 14],
  [21, 15],
  [22, 194],
  [23, 23],
  [24, 22],
  [25, 23],
  [26, 23],
  [27, 17],
]) as Theme

export const light_blue_SliderThumb = n100 as Theme
export const light_blue_Tooltip = n100 as Theme
export const light_blue_ProgressIndicator = n100 as Theme
const n101 = t([
  [12, 60],
  [13, 61],
  [14, 62],
  [15, 63],
  [16, 60],
  [17, 60],
  [18, 11],
  [19, 71],
  [20, 11],
  [21, 71],
  [22, 11],
  [23, 62],
  [24, 63],
  [25, 62],
  [26, 62],
  [27, 70],
]) as Theme

export const light_mint_ListItem = n101 as Theme
const n102 = t([
  [12, 62],
  [13, 63],
  [14, 64],
  [15, 65],
  [16, 61],
  [17, 60],
  [18, 11],
  [19, 71],
  [20, 11],
  [21, 71],
  [22, 11],
  [23, 64],
  [24, 65],
  [25, 64],
  [26, 64],
  [27, 68],
]) as Theme

export const light_mint_Card = n102 as Theme
export const light_mint_DrawerFrame = n102 as Theme
export const light_mint_Progress = n102 as Theme
export const light_mint_TooltipArrow = n102 as Theme
const n103 = t([
  [12, 63],
  [13, 64],
  [14, 65],
  [15, 67],
  [16, 62],
  [17, 61],
  [18, 11],
  [19, 71],
  [20, 11],
  [21, 71],
  [22, 71],
  [23, 64],
  [24, 65],
  [25, 64],
  [26, 64],
  [27, 67],
]) as Theme

export const light_mint_Button = n103 as Theme
export const light_mint_Switch = n103 as Theme
export const light_mint_TooltipContent = n103 as Theme
export const light_mint_SliderTrack = n103 as Theme
const n104 = t([
  [12, 61],
  [13, 62],
  [14, 63],
  [15, 64],
  [16, 60],
  [17, 196],
  [18, 11],
  [19, 71],
  [20, 11],
  [21, 71],
  [22, 197],
  [23, 65],
  [24, 67],
  [25, 65],
  [26, 65],
  [27, 69],
]) as Theme

export const light_mint_Checkbox = n104 as Theme
export const light_mint_RadioGroupItem = n104 as Theme
export const light_mint_Input = n104 as Theme
export const light_mint_TextArea = n104 as Theme
const n105 = t([
  [12, 11],
  [13, 11],
  [14, 71],
  [15, 70],
  [16, 11],
  [17, 11],
  [18, 60],
  [19, 61],
  [20, 60],
  [21, 61],
  [22, 60],
  [23, 71],
  [24, 70],
  [25, 71],
  [26, 71],
  [27, 61],
]) as Theme

export const light_mint_SwitchThumb = n105 as Theme
const n106 = t([
  [12, 69],
  [13, 68],
  [14, 67],
  [15, 65],
  [16, 70],
  [17, 71],
  [18, 60],
  [19, 61],
  [20, 60],
  [21, 61],
  [22, 61],
  [23, 67],
  [24, 65],
  [25, 67],
  [26, 67],
  [27, 65],
]) as Theme

export const light_mint_SliderTrackActive = n106 as Theme
const n107 = t([
  [12, 71],
  [13, 70],
  [14, 69],
  [15, 68],
  [16, 11],
  [17, 197],
  [18, 60],
  [19, 61],
  [20, 60],
  [21, 61],
  [22, 196],
  [23, 69],
  [24, 68],
  [25, 69],
  [26, 69],
  [27, 63],
]) as Theme

export const light_mint_SliderThumb = n107 as Theme
export const light_mint_Tooltip = n107 as Theme
export const light_mint_ProgressIndicator = n107 as Theme
const n108 = t([
  [12, 72],
  [13, 73],
  [14, 74],
  [15, 75],
  [16, 72],
  [17, 72],
  [18, 11],
  [19, 83],
  [20, 11],
  [21, 83],
  [22, 11],
  [23, 74],
  [24, 75],
  [25, 74],
  [26, 74],
  [27, 82],
]) as Theme

export const light_red_ListItem = n108 as Theme
const n109 = t([
  [12, 74],
  [13, 75],
  [14, 76],
  [15, 77],
  [16, 73],
  [17, 72],
  [18, 11],
  [19, 83],
  [20, 11],
  [21, 83],
  [22, 11],
  [23, 76],
  [24, 77],
  [25, 76],
  [26, 76],
  [27, 80],
]) as Theme

export const light_red_Card = n109 as Theme
export const light_red_DrawerFrame = n109 as Theme
export const light_red_Progress = n109 as Theme
export const light_red_TooltipArrow = n109 as Theme
const n110 = t([
  [12, 75],
  [13, 76],
  [14, 77],
  [15, 79],
  [16, 74],
  [17, 73],
  [18, 11],
  [19, 83],
  [20, 11],
  [21, 83],
  [22, 83],
  [23, 76],
  [24, 77],
  [25, 76],
  [26, 76],
  [27, 79],
]) as Theme

export const light_red_Button = n110 as Theme
export const light_red_Switch = n110 as Theme
export const light_red_TooltipContent = n110 as Theme
export const light_red_SliderTrack = n110 as Theme
const n111 = t([
  [12, 73],
  [13, 74],
  [14, 75],
  [15, 76],
  [16, 72],
  [17, 198],
  [18, 11],
  [19, 83],
  [20, 11],
  [21, 83],
  [22, 199],
  [23, 77],
  [24, 79],
  [25, 77],
  [26, 77],
  [27, 81],
]) as Theme

export const light_red_Checkbox = n111 as Theme
export const light_red_RadioGroupItem = n111 as Theme
export const light_red_Input = n111 as Theme
export const light_red_TextArea = n111 as Theme
const n112 = t([
  [12, 11],
  [13, 11],
  [14, 83],
  [15, 82],
  [16, 11],
  [17, 11],
  [18, 72],
  [19, 73],
  [20, 72],
  [21, 73],
  [22, 72],
  [23, 83],
  [24, 82],
  [25, 83],
  [26, 83],
  [27, 73],
]) as Theme

export const light_red_SwitchThumb = n112 as Theme
const n113 = t([
  [12, 81],
  [13, 80],
  [14, 79],
  [15, 77],
  [16, 82],
  [17, 83],
  [18, 72],
  [19, 73],
  [20, 72],
  [21, 73],
  [22, 73],
  [23, 79],
  [24, 77],
  [25, 79],
  [26, 79],
  [27, 77],
]) as Theme

export const light_red_SliderTrackActive = n113 as Theme
const n114 = t([
  [12, 83],
  [13, 82],
  [14, 81],
  [15, 80],
  [16, 11],
  [17, 199],
  [18, 72],
  [19, 73],
  [20, 72],
  [21, 73],
  [22, 198],
  [23, 81],
  [24, 80],
  [25, 81],
  [26, 81],
  [27, 75],
]) as Theme

export const light_red_SliderThumb = n114 as Theme
export const light_red_Tooltip = n114 as Theme
export const light_red_ProgressIndicator = n114 as Theme
const n115 = t([
  [12, 144],
  [13, 145],
  [14, 146],
  [15, 147],
  [16, 143],
  [17, 142],
  [18, 0],
  [19, 152],
  [20, 0],
  [21, 152],
  [22, 0],
  [23, 147],
  [24, 149],
  [25, 146],
  [26, 147],
  [27, 56],
]) as Theme

export const dark_orange_Card = n115 as Theme
export const dark_orange_DrawerFrame = n115 as Theme
export const dark_orange_Progress = n115 as Theme
export const dark_orange_TooltipArrow = n115 as Theme
const n116 = t([
  [12, 145],
  [13, 146],
  [14, 147],
  [15, 149],
  [16, 144],
  [17, 143],
  [18, 0],
  [19, 152],
  [20, 0],
  [21, 152],
  [22, 152],
  [23, 147],
  [24, 149],
  [25, 146],
  [26, 147],
  [27, 149],
]) as Theme

export const dark_orange_Button = n116 as Theme
export const dark_orange_Switch = n116 as Theme
export const dark_orange_TooltipContent = n116 as Theme
export const dark_orange_SliderTrack = n116 as Theme
const n117 = t([
  [12, 143],
  [13, 144],
  [14, 145],
  [15, 146],
  [16, 142],
  [17, 200],
  [18, 0],
  [19, 152],
  [20, 0],
  [21, 152],
  [22, 201],
  [23, 149],
  [24, 56],
  [25, 147],
  [26, 149],
  [27, 150],
]) as Theme

export const dark_orange_Checkbox = n117 as Theme
export const dark_orange_RadioGroupItem = n117 as Theme
export const dark_orange_Input = n117 as Theme
export const dark_orange_TextArea = n117 as Theme
const n118 = t([
  [12, 0],
  [13, 0],
  [14, 152],
  [15, 151],
  [16, 0],
  [17, 0],
  [18, 142],
  [19, 143],
  [20, 142],
  [21, 143],
  [22, 142],
  [23, 151],
  [24, 150],
  [25, 152],
  [26, 151],
  [27, 143],
]) as Theme

export const dark_orange_SwitchThumb = n118 as Theme
const n119 = t([
  [12, 150],
  [13, 56],
  [14, 149],
  [15, 147],
  [16, 151],
  [17, 152],
  [18, 142],
  [19, 143],
  [20, 142],
  [21, 143],
  [22, 143],
  [23, 147],
  [24, 146],
  [25, 149],
  [26, 147],
  [27, 147],
]) as Theme

export const dark_orange_SliderTrackActive = n119 as Theme
const n120 = t([
  [12, 152],
  [13, 151],
  [14, 150],
  [15, 56],
  [16, 0],
  [17, 201],
  [18, 142],
  [19, 143],
  [20, 142],
  [21, 143],
  [22, 200],
  [23, 56],
  [24, 149],
  [25, 150],
  [26, 56],
  [27, 145],
]) as Theme

export const dark_orange_SliderThumb = n120 as Theme
export const dark_orange_Tooltip = n120 as Theme
export const dark_orange_ProgressIndicator = n120 as Theme
const n121 = t([
  [12, 177],
  [13, 178],
  [14, 179],
  [15, 180],
  [16, 176],
  [17, 175],
  [18, 0],
  [19, 185],
  [20, 0],
  [21, 185],
  [22, 0],
  [23, 180],
  [24, 182],
  [25, 179],
  [26, 180],
  [27, 92],
]) as Theme

export const dark_yellow_Card = n121 as Theme
export const dark_yellow_DrawerFrame = n121 as Theme
export const dark_yellow_Progress = n121 as Theme
export const dark_yellow_TooltipArrow = n121 as Theme
const n122 = t([
  [12, 178],
  [13, 179],
  [14, 180],
  [15, 182],
  [16, 177],
  [17, 176],
  [18, 0],
  [19, 185],
  [20, 0],
  [21, 185],
  [22, 185],
  [23, 180],
  [24, 182],
  [25, 179],
  [26, 180],
  [27, 182],
]) as Theme

export const dark_yellow_Button = n122 as Theme
export const dark_yellow_Switch = n122 as Theme
export const dark_yellow_TooltipContent = n122 as Theme
export const dark_yellow_SliderTrack = n122 as Theme
const n123 = t([
  [12, 176],
  [13, 177],
  [14, 178],
  [15, 179],
  [16, 175],
  [17, 202],
  [18, 0],
  [19, 185],
  [20, 0],
  [21, 185],
  [22, 203],
  [23, 182],
  [24, 92],
  [25, 180],
  [26, 182],
  [27, 183],
]) as Theme

export const dark_yellow_Checkbox = n123 as Theme
export const dark_yellow_RadioGroupItem = n123 as Theme
export const dark_yellow_Input = n123 as Theme
export const dark_yellow_TextArea = n123 as Theme
const n124 = t([
  [12, 0],
  [13, 0],
  [14, 185],
  [15, 184],
  [16, 0],
  [17, 0],
  [18, 175],
  [19, 176],
  [20, 175],
  [21, 176],
  [22, 175],
  [23, 184],
  [24, 183],
  [25, 185],
  [26, 184],
  [27, 176],
]) as Theme

export const dark_yellow_SwitchThumb = n124 as Theme
const n125 = t([
  [12, 183],
  [13, 92],
  [14, 182],
  [15, 180],
  [16, 184],
  [17, 185],
  [18, 175],
  [19, 176],
  [20, 175],
  [21, 176],
  [22, 176],
  [23, 180],
  [24, 179],
  [25, 182],
  [26, 180],
  [27, 180],
]) as Theme

export const dark_yellow_SliderTrackActive = n125 as Theme
const n126 = t([
  [12, 185],
  [13, 184],
  [14, 183],
  [15, 92],
  [16, 0],
  [17, 203],
  [18, 175],
  [19, 176],
  [20, 175],
  [21, 176],
  [22, 202],
  [23, 92],
  [24, 182],
  [25, 183],
  [26, 92],
  [27, 178],
]) as Theme

export const dark_yellow_SliderThumb = n126 as Theme
export const dark_yellow_Tooltip = n126 as Theme
export const dark_yellow_ProgressIndicator = n126 as Theme
const n127 = t([
  [12, 133],
  [13, 134],
  [14, 135],
  [15, 136],
  [16, 132],
  [17, 131],
  [18, 0],
  [19, 141],
  [20, 0],
  [21, 141],
  [22, 0],
  [23, 136],
  [24, 138],
  [25, 135],
  [26, 136],
  [27, 44],
]) as Theme

export const dark_green_Card = n127 as Theme
export const dark_green_DrawerFrame = n127 as Theme
export const dark_green_Progress = n127 as Theme
export const dark_green_TooltipArrow = n127 as Theme
const n128 = t([
  [12, 134],
  [13, 135],
  [14, 136],
  [15, 138],
  [16, 133],
  [17, 132],
  [18, 0],
  [19, 141],
  [20, 0],
  [21, 141],
  [22, 141],
  [23, 136],
  [24, 138],
  [25, 135],
  [26, 136],
  [27, 138],
]) as Theme

export const dark_green_Button = n128 as Theme
export const dark_green_Switch = n128 as Theme
export const dark_green_TooltipContent = n128 as Theme
export const dark_green_SliderTrack = n128 as Theme
const n129 = t([
  [12, 132],
  [13, 133],
  [14, 134],
  [15, 135],
  [16, 131],
  [17, 204],
  [18, 0],
  [19, 141],
  [20, 0],
  [21, 141],
  [22, 205],
  [23, 138],
  [24, 44],
  [25, 136],
  [26, 138],
  [27, 139],
]) as Theme

export const dark_green_Checkbox = n129 as Theme
export const dark_green_RadioGroupItem = n129 as Theme
export const dark_green_Input = n129 as Theme
export const dark_green_TextArea = n129 as Theme
const n130 = t([
  [12, 0],
  [13, 0],
  [14, 141],
  [15, 140],
  [16, 0],
  [17, 0],
  [18, 131],
  [19, 132],
  [20, 131],
  [21, 132],
  [22, 131],
  [23, 140],
  [24, 139],
  [25, 141],
  [26, 140],
  [27, 132],
]) as Theme

export const dark_green_SwitchThumb = n130 as Theme
const n131 = t([
  [12, 139],
  [13, 44],
  [14, 138],
  [15, 136],
  [16, 140],
  [17, 141],
  [18, 131],
  [19, 132],
  [20, 131],
  [21, 132],
  [22, 132],
  [23, 136],
  [24, 135],
  [25, 138],
  [26, 136],
  [27, 136],
]) as Theme

export const dark_green_SliderTrackActive = n131 as Theme
const n132 = t([
  [12, 141],
  [13, 140],
  [14, 139],
  [15, 44],
  [16, 0],
  [17, 205],
  [18, 131],
  [19, 132],
  [20, 131],
  [21, 132],
  [22, 204],
  [23, 44],
  [24, 138],
  [25, 139],
  [26, 44],
  [27, 134],
]) as Theme

export const dark_green_SliderThumb = n132 as Theme
export const dark_green_Tooltip = n132 as Theme
export const dark_green_ProgressIndicator = n132 as Theme
const n133 = t([
  [12, 111],
  [13, 112],
  [14, 113],
  [15, 114],
  [16, 110],
  [17, 109],
  [18, 0],
  [19, 119],
  [20, 0],
  [21, 119],
  [22, 0],
  [23, 114],
  [24, 116],
  [25, 113],
  [26, 114],
  [27, 22],
]) as Theme

export const dark_blue_Card = n133 as Theme
export const dark_blue_DrawerFrame = n133 as Theme
export const dark_blue_Progress = n133 as Theme
export const dark_blue_TooltipArrow = n133 as Theme
const n134 = t([
  [12, 112],
  [13, 113],
  [14, 114],
  [15, 116],
  [16, 111],
  [17, 110],
  [18, 0],
  [19, 119],
  [20, 0],
  [21, 119],
  [22, 119],
  [23, 114],
  [24, 116],
  [25, 113],
  [26, 114],
  [27, 116],
]) as Theme

export const dark_blue_Button = n134 as Theme
export const dark_blue_Switch = n134 as Theme
export const dark_blue_TooltipContent = n134 as Theme
export const dark_blue_SliderTrack = n134 as Theme
const n135 = t([
  [12, 110],
  [13, 111],
  [14, 112],
  [15, 113],
  [16, 109],
  [17, 206],
  [18, 0],
  [19, 119],
  [20, 0],
  [21, 119],
  [22, 207],
  [23, 116],
  [24, 22],
  [25, 114],
  [26, 116],
  [27, 117],
]) as Theme

export const dark_blue_Checkbox = n135 as Theme
export const dark_blue_RadioGroupItem = n135 as Theme
export const dark_blue_Input = n135 as Theme
export const dark_blue_TextArea = n135 as Theme
const n136 = t([
  [12, 0],
  [13, 0],
  [14, 119],
  [15, 118],
  [16, 0],
  [17, 0],
  [18, 109],
  [19, 110],
  [20, 109],
  [21, 110],
  [22, 109],
  [23, 118],
  [24, 117],
  [25, 119],
  [26, 118],
  [27, 110],
]) as Theme

export const dark_blue_SwitchThumb = n136 as Theme
const n137 = t([
  [12, 117],
  [13, 22],
  [14, 116],
  [15, 114],
  [16, 118],
  [17, 119],
  [18, 109],
  [19, 110],
  [20, 109],
  [21, 110],
  [22, 110],
  [23, 114],
  [24, 113],
  [25, 116],
  [26, 114],
  [27, 114],
]) as Theme

export const dark_blue_SliderTrackActive = n137 as Theme
const n138 = t([
  [12, 119],
  [13, 118],
  [14, 117],
  [15, 22],
  [16, 0],
  [17, 207],
  [18, 109],
  [19, 110],
  [20, 109],
  [21, 110],
  [22, 206],
  [23, 22],
  [24, 116],
  [25, 117],
  [26, 22],
  [27, 112],
]) as Theme

export const dark_blue_SliderThumb = n138 as Theme
export const dark_blue_Tooltip = n138 as Theme
export const dark_blue_ProgressIndicator = n138 as Theme
const n139 = t([
  [12, 155],
  [13, 156],
  [14, 157],
  [15, 158],
  [16, 154],
  [17, 153],
  [18, 0],
  [19, 163],
  [20, 0],
  [21, 163],
  [22, 0],
  [23, 158],
  [24, 160],
  [25, 157],
  [26, 158],
  [27, 68],
]) as Theme

export const dark_mint_Card = n139 as Theme
export const dark_mint_DrawerFrame = n139 as Theme
export const dark_mint_Progress = n139 as Theme
export const dark_mint_TooltipArrow = n139 as Theme
const n140 = t([
  [12, 156],
  [13, 157],
  [14, 158],
  [15, 160],
  [16, 155],
  [17, 154],
  [18, 0],
  [19, 163],
  [20, 0],
  [21, 163],
  [22, 163],
  [23, 158],
  [24, 160],
  [25, 157],
  [26, 158],
  [27, 160],
]) as Theme

export const dark_mint_Button = n140 as Theme
export const dark_mint_Switch = n140 as Theme
export const dark_mint_TooltipContent = n140 as Theme
export const dark_mint_SliderTrack = n140 as Theme
const n141 = t([
  [12, 154],
  [13, 155],
  [14, 156],
  [15, 157],
  [16, 153],
  [17, 208],
  [18, 0],
  [19, 163],
  [20, 0],
  [21, 163],
  [22, 209],
  [23, 160],
  [24, 68],
  [25, 158],
  [26, 160],
  [27, 161],
]) as Theme

export const dark_mint_Checkbox = n141 as Theme
export const dark_mint_RadioGroupItem = n141 as Theme
export const dark_mint_Input = n141 as Theme
export const dark_mint_TextArea = n141 as Theme
const n142 = t([
  [12, 0],
  [13, 0],
  [14, 163],
  [15, 162],
  [16, 0],
  [17, 0],
  [18, 153],
  [19, 154],
  [20, 153],
  [21, 154],
  [22, 153],
  [23, 162],
  [24, 161],
  [25, 163],
  [26, 162],
  [27, 154],
]) as Theme

export const dark_mint_SwitchThumb = n142 as Theme
const n143 = t([
  [12, 161],
  [13, 68],
  [14, 160],
  [15, 158],
  [16, 162],
  [17, 163],
  [18, 153],
  [19, 154],
  [20, 153],
  [21, 154],
  [22, 154],
  [23, 158],
  [24, 157],
  [25, 160],
  [26, 158],
  [27, 158],
]) as Theme

export const dark_mint_SliderTrackActive = n143 as Theme
const n144 = t([
  [12, 163],
  [13, 162],
  [14, 161],
  [15, 68],
  [16, 0],
  [17, 209],
  [18, 153],
  [19, 154],
  [20, 153],
  [21, 154],
  [22, 208],
  [23, 68],
  [24, 160],
  [25, 161],
  [26, 68],
  [27, 156],
]) as Theme

export const dark_mint_SliderThumb = n144 as Theme
export const dark_mint_Tooltip = n144 as Theme
export const dark_mint_ProgressIndicator = n144 as Theme
const n145 = t([
  [12, 166],
  [13, 167],
  [14, 168],
  [15, 169],
  [16, 165],
  [17, 164],
  [18, 0],
  [19, 174],
  [20, 0],
  [21, 174],
  [22, 0],
  [23, 169],
  [24, 171],
  [25, 168],
  [26, 169],
  [27, 80],
]) as Theme

export const dark_red_Card = n145 as Theme
export const dark_red_DrawerFrame = n145 as Theme
export const dark_red_Progress = n145 as Theme
export const dark_red_TooltipArrow = n145 as Theme
const n146 = t([
  [12, 167],
  [13, 168],
  [14, 169],
  [15, 171],
  [16, 166],
  [17, 165],
  [18, 0],
  [19, 174],
  [20, 0],
  [21, 174],
  [22, 174],
  [23, 169],
  [24, 171],
  [25, 168],
  [26, 169],
  [27, 171],
]) as Theme

export const dark_red_Button = n146 as Theme
export const dark_red_Switch = n146 as Theme
export const dark_red_TooltipContent = n146 as Theme
export const dark_red_SliderTrack = n146 as Theme
const n147 = t([
  [12, 165],
  [13, 166],
  [14, 167],
  [15, 168],
  [16, 164],
  [17, 210],
  [18, 0],
  [19, 174],
  [20, 0],
  [21, 174],
  [22, 211],
  [23, 171],
  [24, 80],
  [25, 169],
  [26, 171],
  [27, 172],
]) as Theme

export const dark_red_Checkbox = n147 as Theme
export const dark_red_RadioGroupItem = n147 as Theme
export const dark_red_Input = n147 as Theme
export const dark_red_TextArea = n147 as Theme
const n148 = t([
  [12, 0],
  [13, 0],
  [14, 174],
  [15, 173],
  [16, 0],
  [17, 0],
  [18, 164],
  [19, 165],
  [20, 164],
  [21, 165],
  [22, 164],
  [23, 173],
  [24, 172],
  [25, 174],
  [26, 173],
  [27, 165],
]) as Theme

export const dark_red_SwitchThumb = n148 as Theme
const n149 = t([
  [12, 172],
  [13, 80],
  [14, 171],
  [15, 169],
  [16, 173],
  [17, 174],
  [18, 164],
  [19, 165],
  [20, 164],
  [21, 165],
  [22, 165],
  [23, 169],
  [24, 168],
  [25, 171],
  [26, 169],
  [27, 169],
]) as Theme

export const dark_red_SliderTrackActive = n149 as Theme
const n150 = t([
  [12, 174],
  [13, 173],
  [14, 172],
  [15, 80],
  [16, 0],
  [17, 211],
  [18, 164],
  [19, 165],
  [20, 164],
  [21, 165],
  [22, 210],
  [23, 80],
  [24, 171],
  [25, 172],
  [26, 80],
  [27, 167],
]) as Theme

export const dark_red_SliderThumb = n150 as Theme
export const dark_red_Tooltip = n150 as Theme
export const dark_red_ProgressIndicator = n150 as Theme
const n151 = t([
  [12, 1],
  [13, 2],
  [14, 3],
  [15, 4],
  [16, 0],
  [17, 0],
  [18, 10],
  [19, 9],
  [20, 10],
  [21, 9],
  [22, 11],
  [23, 4],
  [24, 5],
  [25, 3],
  [26, 4],
  [27, 8],
]) as Theme

export const light_alt1_ListItem = n151 as Theme
const n152 = t([
  [12, 3],
  [13, 4],
  [14, 5],
  [15, 6],
  [16, 2],
  [17, 1],
  [18, 10],
  [19, 9],
  [20, 10],
  [21, 9],
  [22, 10],
  [23, 6],
  [24, 7],
  [25, 5],
  [26, 6],
  [27, 6],
]) as Theme

export const light_alt1_Card = n152 as Theme
export const light_alt1_DrawerFrame = n152 as Theme
export const light_alt1_Progress = n152 as Theme
export const light_alt1_TooltipArrow = n152 as Theme
const n153 = t([
  [12, 4],
  [13, 5],
  [14, 6],
  [15, 7],
  [16, 3],
  [17, 2],
  [18, 10],
  [19, 9],
  [20, 10],
  [21, 9],
  [22, 9],
  [23, 6],
  [24, 7],
  [25, 5],
  [26, 6],
  [27, 5],
]) as Theme

export const light_alt1_Button = n153 as Theme
export const light_alt1_Switch = n153 as Theme
export const light_alt1_TooltipContent = n153 as Theme
export const light_alt1_SliderTrack = n153 as Theme
const n154 = t([
  [12, 2],
  [13, 3],
  [14, 4],
  [15, 5],
  [16, 1],
  [17, 0],
  [18, 10],
  [19, 9],
  [20, 10],
  [21, 9],
  [22, 11],
  [23, 7],
  [24, 8],
  [25, 6],
  [26, 7],
  [27, 7],
]) as Theme

export const light_alt1_Checkbox = n154 as Theme
export const light_alt1_RadioGroupItem = n154 as Theme
export const light_alt1_Input = n154 as Theme
export const light_alt1_TextArea = n154 as Theme
const n155 = t([
  [12, 11],
  [13, 10],
  [14, 9],
  [15, 8],
  [16, 11],
  [17, 11],
  [18, 1],
  [19, 2],
  [20, 1],
  [21, 2],
  [22, 0],
  [23, 8],
  [24, 7],
  [25, 9],
  [26, 8],
  [27, 2],
]) as Theme

export const light_alt1_SwitchThumb = n155 as Theme
const n156 = t([
  [12, 7],
  [13, 6],
  [14, 5],
  [15, 4],
  [16, 8],
  [17, 9],
  [18, 1],
  [19, 2],
  [20, 1],
  [21, 2],
  [22, 2],
  [23, 4],
  [24, 3],
  [25, 5],
  [26, 4],
  [27, 6],
]) as Theme

export const light_alt1_SliderTrackActive = n156 as Theme
const n157 = t([
  [12, 9],
  [13, 8],
  [14, 7],
  [15, 6],
  [16, 10],
  [17, 11],
  [18, 1],
  [19, 2],
  [20, 1],
  [21, 2],
  [22, 0],
  [23, 6],
  [24, 5],
  [25, 7],
  [26, 6],
  [27, 4],
]) as Theme

export const light_alt1_SliderThumb = n157 as Theme
export const light_alt1_Tooltip = n157 as Theme
export const light_alt1_ProgressIndicator = n157 as Theme
const n158 = t([
  [12, 2],
  [13, 3],
  [14, 4],
  [15, 5],
  [16, 1],
  [17, 0],
  [18, 9],
  [19, 8],
  [20, 9],
  [21, 8],
  [22, 11],
  [23, 4],
  [24, 5],
  [25, 3],
  [26, 4],
  [27, 7],
]) as Theme

export const light_alt2_ListItem = n158 as Theme
const n159 = t([
  [12, 4],
  [13, 5],
  [14, 6],
  [15, 7],
  [16, 3],
  [17, 2],
  [18, 9],
  [19, 8],
  [20, 9],
  [21, 8],
  [22, 9],
  [23, 6],
  [24, 7],
  [25, 5],
  [26, 6],
  [27, 5],
]) as Theme

export const light_alt2_Card = n159 as Theme
export const light_alt2_DrawerFrame = n159 as Theme
export const light_alt2_Progress = n159 as Theme
export const light_alt2_TooltipArrow = n159 as Theme
const n160 = t([
  [12, 5],
  [13, 6],
  [14, 7],
  [15, 8],
  [16, 4],
  [17, 3],
  [18, 9],
  [19, 8],
  [20, 9],
  [21, 8],
  [22, 8],
  [23, 6],
  [24, 7],
  [25, 5],
  [26, 6],
  [27, 4],
]) as Theme

export const light_alt2_Button = n160 as Theme
export const light_alt2_Switch = n160 as Theme
export const light_alt2_TooltipContent = n160 as Theme
export const light_alt2_SliderTrack = n160 as Theme
const n161 = t([
  [12, 3],
  [13, 4],
  [14, 5],
  [15, 6],
  [16, 2],
  [17, 1],
  [18, 9],
  [19, 8],
  [20, 9],
  [21, 8],
  [22, 10],
  [23, 7],
  [24, 8],
  [25, 6],
  [26, 7],
  [27, 6],
]) as Theme

export const light_alt2_Checkbox = n161 as Theme
export const light_alt2_RadioGroupItem = n161 as Theme
export const light_alt2_Input = n161 as Theme
export const light_alt2_TextArea = n161 as Theme
const n162 = t([
  [12, 10],
  [13, 9],
  [14, 8],
  [15, 7],
  [16, 11],
  [17, 11],
  [18, 2],
  [19, 3],
  [20, 2],
  [21, 3],
  [22, 0],
  [23, 8],
  [24, 7],
  [25, 9],
  [26, 8],
  [27, 3],
]) as Theme

export const light_alt2_SwitchThumb = n162 as Theme
const n163 = t([
  [12, 6],
  [13, 5],
  [14, 4],
  [15, 3],
  [16, 7],
  [17, 8],
  [18, 2],
  [19, 3],
  [20, 2],
  [21, 3],
  [22, 3],
  [23, 4],
  [24, 3],
  [25, 5],
  [26, 4],
  [27, 7],
]) as Theme

export const light_alt2_SliderTrackActive = n163 as Theme
const n164 = t([
  [12, 8],
  [13, 7],
  [14, 6],
  [15, 5],
  [16, 9],
  [17, 10],
  [18, 2],
  [19, 3],
  [20, 2],
  [21, 3],
  [22, 1],
  [23, 6],
  [24, 5],
  [25, 7],
  [26, 6],
  [27, 5],
]) as Theme

export const light_alt2_SliderThumb = n164 as Theme
export const light_alt2_Tooltip = n164 as Theme
export const light_alt2_ProgressIndicator = n164 as Theme
const n165 = t([
  [12, 3],
  [13, 4],
  [14, 5],
  [15, 6],
  [16, 2],
  [17, 1],
  [19, 7],
  [20, 8],
  [21, 7],
  [22, 10],
  [23, 5],
  [24, 6],
  [25, 4],
  [26, 5],
  [27, 6],
]) as Theme

export const light_active_ListItem = n165 as Theme
const n166 = t([
  [12, 5],
  [13, 6],
  [14, 7],
  [15, 8],
  [16, 4],
  [17, 3],
  [19, 7],
  [20, 8],
  [21, 7],
  [22, 8],
  [23, 7],
  [24, 8],
  [25, 6],
  [26, 7],
  [27, 4],
]) as Theme

export const light_active_Card = n166 as Theme
export const light_active_DrawerFrame = n166 as Theme
export const light_active_Progress = n166 as Theme
export const light_active_TooltipArrow = n166 as Theme
const n167 = t([
  [12, 6],
  [13, 7],
  [14, 8],
  [15, 9],
  [16, 5],
  [17, 4],
  [19, 7],
  [20, 8],
  [21, 7],
  [22, 7],
  [23, 7],
  [24, 8],
  [25, 6],
  [26, 7],
  [27, 3],
]) as Theme

export const light_active_Button = n167 as Theme
export const light_active_Switch = n167 as Theme
export const light_active_TooltipContent = n167 as Theme
export const light_active_SliderTrack = n167 as Theme
const n168 = t([
  [12, 4],
  [13, 5],
  [14, 6],
  [15, 7],
  [16, 3],
  [17, 2],
  [19, 7],
  [20, 8],
  [21, 7],
  [22, 9],
  [23, 8],
  [24, 9],
  [25, 7],
  [26, 8],
  [27, 5],
]) as Theme

export const light_active_Checkbox = n168 as Theme
export const light_active_RadioGroupItem = n168 as Theme
export const light_active_Input = n168 as Theme
export const light_active_TextArea = n168 as Theme
const n169 = t([
  [12, 9],
  [13, 8],
  [14, 7],
  [15, 6],
  [16, 10],
  [17, 11],
  [19, 4],
  [20, 3],
  [21, 4],
  [22, 0],
  [23, 7],
  [24, 6],
  [25, 8],
  [26, 7],
  [27, 4],
]) as Theme

export const light_active_SwitchThumb = n169 as Theme
const n170 = t([
  [12, 5],
  [13, 4],
  [14, 3],
  [15, 2],
  [16, 6],
  [17, 7],
  [19, 4],
  [20, 3],
  [21, 4],
  [22, 4],
  [23, 3],
  [24, 2],
  [25, 4],
  [26, 3],
  [27, 8],
]) as Theme

export const light_active_SliderTrackActive = n170 as Theme
const n171 = t([
  [12, 7],
  [13, 6],
  [14, 5],
  [15, 4],
  [16, 8],
  [17, 9],
  [19, 4],
  [20, 3],
  [21, 4],
  [22, 2],
  [23, 5],
  [24, 4],
  [25, 6],
  [26, 5],
  [27, 6],
]) as Theme

export const light_active_SliderThumb = n171 as Theme
export const light_active_Tooltip = n171 as Theme
export const light_active_ProgressIndicator = n171 as Theme
const n172 = t([
  [12, 101],
  [13, 102],
  [14, 103],
  [15, 104],
  [16, 100],
  [17, 99],
  [18, 108],
  [19, 107],
  [20, 108],
  [21, 107],
  [22, 108],
  [23, 104],
  [24, 105],
  [25, 103],
  [26, 104],
  [27, 104],
]) as Theme

export const dark_alt1_Card = n172 as Theme
export const dark_alt1_DrawerFrame = n172 as Theme
export const dark_alt1_Progress = n172 as Theme
export const dark_alt1_TooltipArrow = n172 as Theme
const n173 = t([
  [12, 102],
  [13, 103],
  [14, 104],
  [15, 105],
  [16, 101],
  [17, 100],
  [18, 108],
  [19, 107],
  [20, 108],
  [21, 107],
  [22, 107],
  [23, 104],
  [24, 105],
  [25, 103],
  [26, 104],
  [27, 103],
]) as Theme

export const dark_alt1_Button = n173 as Theme
export const dark_alt1_Switch = n173 as Theme
export const dark_alt1_TooltipContent = n173 as Theme
export const dark_alt1_SliderTrack = n173 as Theme
const n174 = t([
  [12, 100],
  [13, 101],
  [14, 102],
  [15, 103],
  [16, 99],
  [17, 98],
  [18, 108],
  [19, 107],
  [20, 108],
  [21, 107],
  [22, 0],
  [23, 105],
  [24, 106],
  [25, 104],
  [26, 105],
  [27, 105],
]) as Theme

export const dark_alt1_Checkbox = n174 as Theme
export const dark_alt1_RadioGroupItem = n174 as Theme
export const dark_alt1_Input = n174 as Theme
export const dark_alt1_TextArea = n174 as Theme
const n175 = t([
  [12, 0],
  [13, 108],
  [14, 107],
  [15, 106],
  [16, 0],
  [17, 0],
  [18, 99],
  [19, 100],
  [20, 99],
  [21, 100],
  [22, 98],
  [23, 106],
  [24, 105],
  [25, 107],
  [26, 106],
  [27, 100],
]) as Theme

export const dark_alt1_SwitchThumb = n175 as Theme
const n176 = t([
  [12, 105],
  [13, 104],
  [14, 103],
  [15, 102],
  [16, 106],
  [17, 107],
  [18, 99],
  [19, 100],
  [20, 99],
  [21, 100],
  [22, 100],
  [23, 102],
  [24, 101],
  [25, 103],
  [26, 102],
  [27, 104],
]) as Theme

export const dark_alt1_SliderTrackActive = n176 as Theme
const n177 = t([
  [12, 107],
  [13, 106],
  [14, 105],
  [15, 104],
  [16, 108],
  [17, 0],
  [18, 99],
  [19, 100],
  [20, 99],
  [21, 100],
  [22, 98],
  [23, 104],
  [24, 103],
  [25, 105],
  [26, 104],
  [27, 102],
]) as Theme

export const dark_alt1_SliderThumb = n177 as Theme
export const dark_alt1_Tooltip = n177 as Theme
export const dark_alt1_ProgressIndicator = n177 as Theme
const n178 = t([
  [12, 102],
  [13, 103],
  [14, 104],
  [15, 105],
  [16, 101],
  [17, 100],
  [18, 107],
  [19, 106],
  [20, 107],
  [21, 106],
  [22, 107],
  [23, 104],
  [24, 105],
  [25, 103],
  [26, 104],
  [27, 103],
]) as Theme

export const dark_alt2_Card = n178 as Theme
export const dark_alt2_DrawerFrame = n178 as Theme
export const dark_alt2_Progress = n178 as Theme
export const dark_alt2_TooltipArrow = n178 as Theme
const n179 = t([
  [12, 103],
  [13, 104],
  [14, 105],
  [15, 106],
  [16, 102],
  [17, 101],
  [18, 107],
  [19, 106],
  [20, 107],
  [21, 106],
  [22, 106],
  [23, 104],
  [24, 105],
  [25, 103],
  [26, 104],
  [27, 102],
]) as Theme

export const dark_alt2_Button = n179 as Theme
export const dark_alt2_Switch = n179 as Theme
export const dark_alt2_TooltipContent = n179 as Theme
export const dark_alt2_SliderTrack = n179 as Theme
const n180 = t([
  [12, 101],
  [13, 102],
  [14, 103],
  [15, 104],
  [16, 100],
  [17, 99],
  [18, 107],
  [19, 106],
  [20, 107],
  [21, 106],
  [22, 108],
  [23, 105],
  [24, 106],
  [25, 104],
  [26, 105],
  [27, 104],
]) as Theme

export const dark_alt2_Checkbox = n180 as Theme
export const dark_alt2_RadioGroupItem = n180 as Theme
export const dark_alt2_Input = n180 as Theme
export const dark_alt2_TextArea = n180 as Theme
const n181 = t([
  [12, 108],
  [13, 107],
  [14, 106],
  [15, 105],
  [16, 0],
  [17, 0],
  [18, 100],
  [19, 101],
  [20, 100],
  [21, 101],
  [22, 98],
  [23, 106],
  [24, 105],
  [25, 107],
  [26, 106],
  [27, 101],
]) as Theme

export const dark_alt2_SwitchThumb = n181 as Theme
const n182 = t([
  [12, 104],
  [13, 103],
  [14, 102],
  [15, 101],
  [16, 105],
  [17, 106],
  [18, 100],
  [19, 101],
  [20, 100],
  [21, 101],
  [22, 101],
  [23, 102],
  [24, 101],
  [25, 103],
  [26, 102],
  [27, 105],
]) as Theme

export const dark_alt2_SliderTrackActive = n182 as Theme
const n183 = t([
  [12, 106],
  [13, 105],
  [14, 104],
  [15, 103],
  [16, 107],
  [17, 108],
  [18, 100],
  [19, 101],
  [20, 100],
  [21, 101],
  [22, 99],
  [23, 104],
  [24, 103],
  [25, 105],
  [26, 104],
  [27, 103],
]) as Theme

export const dark_alt2_SliderThumb = n183 as Theme
export const dark_alt2_Tooltip = n183 as Theme
export const dark_alt2_ProgressIndicator = n183 as Theme
const n184 = t([
  [12, 103],
  [13, 104],
  [14, 105],
  [15, 106],
  [16, 102],
  [17, 101],
  [19, 105],
  [20, 106],
  [21, 105],
  [22, 106],
  [23, 105],
  [24, 106],
  [25, 104],
  [26, 105],
  [27, 102],
]) as Theme

export const dark_active_Card = n184 as Theme
export const dark_active_DrawerFrame = n184 as Theme
export const dark_active_Progress = n184 as Theme
export const dark_active_TooltipArrow = n184 as Theme
const n185 = t([
  [12, 104],
  [13, 105],
  [14, 106],
  [15, 107],
  [16, 103],
  [17, 102],
  [19, 105],
  [20, 106],
  [21, 105],
  [22, 105],
  [23, 105],
  [24, 106],
  [25, 104],
  [26, 105],
  [27, 101],
]) as Theme

export const dark_active_Button = n185 as Theme
export const dark_active_Switch = n185 as Theme
export const dark_active_TooltipContent = n185 as Theme
export const dark_active_SliderTrack = n185 as Theme
const n186 = t([
  [12, 102],
  [13, 103],
  [14, 104],
  [15, 105],
  [16, 101],
  [17, 100],
  [19, 105],
  [20, 106],
  [21, 105],
  [22, 107],
  [23, 106],
  [24, 107],
  [25, 105],
  [26, 106],
  [27, 103],
]) as Theme

export const dark_active_Checkbox = n186 as Theme
export const dark_active_RadioGroupItem = n186 as Theme
export const dark_active_Input = n186 as Theme
export const dark_active_TextArea = n186 as Theme
const n187 = t([
  [12, 107],
  [13, 106],
  [14, 105],
  [15, 104],
  [16, 108],
  [17, 0],
  [19, 102],
  [20, 101],
  [21, 102],
  [22, 98],
  [23, 105],
  [24, 104],
  [25, 106],
  [26, 105],
  [27, 102],
]) as Theme

export const dark_active_SwitchThumb = n187 as Theme
const n188 = t([
  [12, 103],
  [13, 102],
  [14, 101],
  [15, 100],
  [16, 104],
  [17, 105],
  [19, 102],
  [20, 101],
  [21, 102],
  [22, 102],
  [23, 101],
  [24, 100],
  [25, 102],
  [26, 101],
  [27, 106],
]) as Theme

export const dark_active_SliderTrackActive = n188 as Theme
const n189 = t([
  [12, 105],
  [13, 104],
  [14, 103],
  [15, 102],
  [16, 106],
  [17, 107],
  [19, 102],
  [20, 101],
  [21, 102],
  [22, 100],
  [23, 103],
  [24, 102],
  [25, 104],
  [26, 103],
  [27, 104],
]) as Theme

export const dark_active_SliderThumb = n189 as Theme
export const dark_active_Tooltip = n189 as Theme
export const dark_active_ProgressIndicator = n189 as Theme
const n190 = t([
  [12, 49],
  [13, 50],
  [14, 51],
  [15, 52],
  [16, 48],
  [17, 48],
  [18, 59],
  [19, 58],
  [20, 59],
  [21, 58],
  [22, 11],
  [23, 51],
  [24, 52],
  [25, 51],
  [26, 51],
  [27, 57],
]) as Theme

export const light_orange_alt1_ListItem = n190 as Theme
const n191 = t([
  [12, 51],
  [13, 52],
  [14, 53],
  [15, 55],
  [16, 50],
  [17, 49],
  [18, 59],
  [19, 58],
  [20, 59],
  [21, 58],
  [22, 59],
  [23, 53],
  [24, 55],
  [25, 53],
  [26, 53],
  [27, 55],
]) as Theme

export const light_orange_alt1_Card = n191 as Theme
export const light_orange_alt1_DrawerFrame = n191 as Theme
export const light_orange_alt1_Progress = n191 as Theme
export const light_orange_alt1_TooltipArrow = n191 as Theme
const n192 = t([
  [12, 52],
  [13, 53],
  [14, 55],
  [15, 56],
  [16, 51],
  [17, 50],
  [18, 59],
  [19, 58],
  [20, 59],
  [21, 58],
  [22, 58],
  [23, 53],
  [24, 55],
  [25, 53],
  [26, 53],
  [27, 53],
]) as Theme

export const light_orange_alt1_Button = n192 as Theme
export const light_orange_alt1_Switch = n192 as Theme
export const light_orange_alt1_TooltipContent = n192 as Theme
export const light_orange_alt1_SliderTrack = n192 as Theme
const n193 = t([
  [12, 50],
  [13, 51],
  [14, 52],
  [15, 53],
  [16, 49],
  [17, 48],
  [18, 59],
  [19, 58],
  [20, 59],
  [21, 58],
  [22, 11],
  [23, 55],
  [24, 56],
  [25, 55],
  [26, 55],
  [27, 56],
]) as Theme

export const light_orange_alt1_Checkbox = n193 as Theme
export const light_orange_alt1_RadioGroupItem = n193 as Theme
export const light_orange_alt1_Input = n193 as Theme
export const light_orange_alt1_TextArea = n193 as Theme
const n194 = t([
  [12, 11],
  [13, 59],
  [14, 58],
  [15, 57],
  [16, 11],
  [17, 11],
  [18, 49],
  [19, 50],
  [20, 49],
  [21, 50],
  [22, 48],
  [23, 58],
  [24, 57],
  [25, 58],
  [26, 58],
  [27, 50],
]) as Theme

export const light_orange_alt1_SwitchThumb = n194 as Theme
const n195 = t([
  [12, 56],
  [13, 55],
  [14, 53],
  [15, 52],
  [16, 57],
  [17, 58],
  [18, 49],
  [19, 50],
  [20, 49],
  [21, 50],
  [22, 50],
  [23, 53],
  [24, 52],
  [25, 53],
  [26, 53],
  [27, 55],
]) as Theme

export const light_orange_alt1_SliderTrackActive = n195 as Theme
const n196 = t([
  [12, 58],
  [13, 57],
  [14, 56],
  [15, 55],
  [16, 59],
  [17, 11],
  [18, 49],
  [19, 50],
  [20, 49],
  [21, 50],
  [22, 48],
  [23, 56],
  [24, 55],
  [25, 56],
  [26, 56],
  [27, 52],
]) as Theme

export const light_orange_alt1_SliderThumb = n196 as Theme
export const light_orange_alt1_Tooltip = n196 as Theme
export const light_orange_alt1_ProgressIndicator = n196 as Theme
const n197 = t([
  [12, 50],
  [13, 51],
  [14, 52],
  [15, 53],
  [16, 49],
  [17, 48],
  [18, 58],
  [19, 57],
  [20, 58],
  [21, 57],
  [22, 11],
  [23, 51],
  [24, 52],
  [25, 51],
  [26, 51],
  [27, 56],
]) as Theme

export const light_orange_alt2_ListItem = n197 as Theme
const n198 = t([
  [12, 52],
  [13, 53],
  [14, 55],
  [15, 56],
  [16, 51],
  [17, 50],
  [18, 58],
  [19, 57],
  [20, 58],
  [21, 57],
  [22, 58],
  [23, 53],
  [24, 55],
  [25, 53],
  [26, 53],
  [27, 53],
]) as Theme

export const light_orange_alt2_Card = n198 as Theme
export const light_orange_alt2_DrawerFrame = n198 as Theme
export const light_orange_alt2_Progress = n198 as Theme
export const light_orange_alt2_TooltipArrow = n198 as Theme
const n199 = t([
  [12, 53],
  [13, 55],
  [14, 56],
  [15, 57],
  [16, 52],
  [17, 51],
  [18, 58],
  [19, 57],
  [20, 58],
  [21, 57],
  [22, 57],
  [23, 53],
  [24, 55],
  [25, 53],
  [26, 53],
  [27, 52],
]) as Theme

export const light_orange_alt2_Button = n199 as Theme
export const light_orange_alt2_Switch = n199 as Theme
export const light_orange_alt2_TooltipContent = n199 as Theme
export const light_orange_alt2_SliderTrack = n199 as Theme
const n200 = t([
  [12, 51],
  [13, 52],
  [14, 53],
  [15, 55],
  [16, 50],
  [17, 49],
  [18, 58],
  [19, 57],
  [20, 58],
  [21, 57],
  [22, 59],
  [23, 55],
  [24, 56],
  [25, 55],
  [26, 55],
  [27, 55],
]) as Theme

export const light_orange_alt2_Checkbox = n200 as Theme
export const light_orange_alt2_RadioGroupItem = n200 as Theme
export const light_orange_alt2_Input = n200 as Theme
export const light_orange_alt2_TextArea = n200 as Theme
const n201 = t([
  [12, 59],
  [13, 58],
  [14, 57],
  [15, 56],
  [16, 11],
  [17, 11],
  [18, 50],
  [19, 51],
  [20, 50],
  [21, 51],
  [22, 48],
  [23, 58],
  [24, 57],
  [25, 58],
  [26, 58],
  [27, 51],
]) as Theme

export const light_orange_alt2_SwitchThumb = n201 as Theme
const n202 = t([
  [12, 55],
  [13, 53],
  [14, 52],
  [15, 51],
  [16, 56],
  [17, 57],
  [18, 50],
  [19, 51],
  [20, 50],
  [21, 51],
  [22, 51],
  [23, 53],
  [24, 52],
  [25, 53],
  [26, 53],
  [27, 56],
]) as Theme

export const light_orange_alt2_SliderTrackActive = n202 as Theme
const n203 = t([
  [12, 57],
  [13, 56],
  [14, 55],
  [15, 53],
  [16, 58],
  [17, 59],
  [18, 50],
  [19, 51],
  [20, 50],
  [21, 51],
  [22, 49],
  [23, 56],
  [24, 55],
  [25, 56],
  [26, 56],
  [27, 53],
]) as Theme

export const light_orange_alt2_SliderThumb = n203 as Theme
export const light_orange_alt2_Tooltip = n203 as Theme
export const light_orange_alt2_ProgressIndicator = n203 as Theme
const n204 = t([
  [12, 51],
  [13, 52],
  [14, 53],
  [15, 55],
  [16, 50],
  [17, 49],
  [19, 56],
  [20, 57],
  [21, 56],
  [22, 59],
  [23, 52],
  [24, 53],
  [25, 52],
  [26, 52],
  [27, 55],
]) as Theme

export const light_orange_active_ListItem = n204 as Theme
const n205 = t([
  [12, 53],
  [13, 55],
  [14, 56],
  [15, 57],
  [16, 52],
  [17, 51],
  [19, 56],
  [20, 57],
  [21, 56],
  [22, 57],
  [23, 55],
  [24, 56],
  [25, 55],
  [26, 55],
  [27, 52],
]) as Theme

export const light_orange_active_Card = n205 as Theme
export const light_orange_active_DrawerFrame = n205 as Theme
export const light_orange_active_Progress = n205 as Theme
export const light_orange_active_TooltipArrow = n205 as Theme
const n206 = t([
  [12, 55],
  [13, 56],
  [14, 57],
  [15, 58],
  [16, 53],
  [17, 52],
  [19, 56],
  [20, 57],
  [21, 56],
  [22, 56],
  [23, 55],
  [24, 56],
  [25, 55],
  [26, 55],
  [27, 51],
]) as Theme

export const light_orange_active_Button = n206 as Theme
export const light_orange_active_Switch = n206 as Theme
export const light_orange_active_TooltipContent = n206 as Theme
export const light_orange_active_SliderTrack = n206 as Theme
const n207 = t([
  [12, 52],
  [13, 53],
  [14, 55],
  [15, 56],
  [16, 51],
  [17, 50],
  [19, 56],
  [20, 57],
  [21, 56],
  [22, 58],
  [23, 56],
  [24, 57],
  [25, 56],
  [26, 56],
  [27, 53],
]) as Theme

export const light_orange_active_Checkbox = n207 as Theme
export const light_orange_active_RadioGroupItem = n207 as Theme
export const light_orange_active_Input = n207 as Theme
export const light_orange_active_TextArea = n207 as Theme
const n208 = t([
  [12, 58],
  [13, 57],
  [14, 56],
  [15, 55],
  [16, 59],
  [17, 11],
  [19, 52],
  [20, 51],
  [21, 52],
  [22, 48],
  [23, 57],
  [24, 56],
  [25, 57],
  [26, 57],
  [27, 52],
]) as Theme

export const light_orange_active_SwitchThumb = n208 as Theme
const n209 = t([
  [12, 53],
  [13, 52],
  [14, 51],
  [15, 50],
  [16, 55],
  [17, 56],
  [19, 52],
  [20, 51],
  [21, 52],
  [22, 52],
  [23, 52],
  [24, 51],
  [25, 52],
  [26, 52],
  [27, 57],
]) as Theme

export const light_orange_active_SliderTrackActive = n209 as Theme
const n210 = t([
  [12, 56],
  [13, 55],
  [14, 53],
  [15, 52],
  [16, 57],
  [17, 58],
  [19, 52],
  [20, 51],
  [21, 52],
  [22, 50],
  [23, 55],
  [24, 53],
  [25, 55],
  [26, 55],
  [27, 55],
]) as Theme

export const light_orange_active_SliderThumb = n210 as Theme
export const light_orange_active_Tooltip = n210 as Theme
export const light_orange_active_ProgressIndicator = n210 as Theme
const n211 = t([
  [12, 85],
  [13, 86],
  [14, 87],
  [15, 88],
  [16, 84],
  [17, 84],
  [18, 95],
  [19, 94],
  [20, 95],
  [21, 94],
  [22, 11],
  [23, 87],
  [24, 88],
  [25, 87],
  [26, 87],
  [27, 93],
]) as Theme

export const light_yellow_alt1_ListItem = n211 as Theme
const n212 = t([
  [12, 87],
  [13, 88],
  [14, 89],
  [15, 91],
  [16, 86],
  [17, 85],
  [18, 95],
  [19, 94],
  [20, 95],
  [21, 94],
  [22, 95],
  [23, 89],
  [24, 91],
  [25, 89],
  [26, 89],
  [27, 91],
]) as Theme

export const light_yellow_alt1_Card = n212 as Theme
export const light_yellow_alt1_DrawerFrame = n212 as Theme
export const light_yellow_alt1_Progress = n212 as Theme
export const light_yellow_alt1_TooltipArrow = n212 as Theme
const n213 = t([
  [12, 88],
  [13, 89],
  [14, 91],
  [15, 92],
  [16, 87],
  [17, 86],
  [18, 95],
  [19, 94],
  [20, 95],
  [21, 94],
  [22, 94],
  [23, 89],
  [24, 91],
  [25, 89],
  [26, 89],
  [27, 89],
]) as Theme

export const light_yellow_alt1_Button = n213 as Theme
export const light_yellow_alt1_Switch = n213 as Theme
export const light_yellow_alt1_TooltipContent = n213 as Theme
export const light_yellow_alt1_SliderTrack = n213 as Theme
const n214 = t([
  [12, 86],
  [13, 87],
  [14, 88],
  [15, 89],
  [16, 85],
  [17, 84],
  [18, 95],
  [19, 94],
  [20, 95],
  [21, 94],
  [22, 11],
  [23, 91],
  [24, 92],
  [25, 91],
  [26, 91],
  [27, 92],
]) as Theme

export const light_yellow_alt1_Checkbox = n214 as Theme
export const light_yellow_alt1_RadioGroupItem = n214 as Theme
export const light_yellow_alt1_Input = n214 as Theme
export const light_yellow_alt1_TextArea = n214 as Theme
const n215 = t([
  [12, 11],
  [13, 95],
  [14, 94],
  [15, 93],
  [16, 11],
  [17, 11],
  [18, 85],
  [19, 86],
  [20, 85],
  [21, 86],
  [22, 84],
  [23, 94],
  [24, 93],
  [25, 94],
  [26, 94],
  [27, 86],
]) as Theme

export const light_yellow_alt1_SwitchThumb = n215 as Theme
const n216 = t([
  [12, 92],
  [13, 91],
  [14, 89],
  [15, 88],
  [16, 93],
  [17, 94],
  [18, 85],
  [19, 86],
  [20, 85],
  [21, 86],
  [22, 86],
  [23, 89],
  [24, 88],
  [25, 89],
  [26, 89],
  [27, 91],
]) as Theme

export const light_yellow_alt1_SliderTrackActive = n216 as Theme
const n217 = t([
  [12, 94],
  [13, 93],
  [14, 92],
  [15, 91],
  [16, 95],
  [17, 11],
  [18, 85],
  [19, 86],
  [20, 85],
  [21, 86],
  [22, 84],
  [23, 92],
  [24, 91],
  [25, 92],
  [26, 92],
  [27, 88],
]) as Theme

export const light_yellow_alt1_SliderThumb = n217 as Theme
export const light_yellow_alt1_Tooltip = n217 as Theme
export const light_yellow_alt1_ProgressIndicator = n217 as Theme
const n218 = t([
  [12, 86],
  [13, 87],
  [14, 88],
  [15, 89],
  [16, 85],
  [17, 84],
  [18, 94],
  [19, 93],
  [20, 94],
  [21, 93],
  [22, 11],
  [23, 87],
  [24, 88],
  [25, 87],
  [26, 87],
  [27, 92],
]) as Theme

export const light_yellow_alt2_ListItem = n218 as Theme
const n219 = t([
  [12, 88],
  [13, 89],
  [14, 91],
  [15, 92],
  [16, 87],
  [17, 86],
  [18, 94],
  [19, 93],
  [20, 94],
  [21, 93],
  [22, 94],
  [23, 89],
  [24, 91],
  [25, 89],
  [26, 89],
  [27, 89],
]) as Theme

export const light_yellow_alt2_Card = n219 as Theme
export const light_yellow_alt2_DrawerFrame = n219 as Theme
export const light_yellow_alt2_Progress = n219 as Theme
export const light_yellow_alt2_TooltipArrow = n219 as Theme
const n220 = t([
  [12, 89],
  [13, 91],
  [14, 92],
  [15, 93],
  [16, 88],
  [17, 87],
  [18, 94],
  [19, 93],
  [20, 94],
  [21, 93],
  [22, 93],
  [23, 89],
  [24, 91],
  [25, 89],
  [26, 89],
  [27, 88],
]) as Theme

export const light_yellow_alt2_Button = n220 as Theme
export const light_yellow_alt2_Switch = n220 as Theme
export const light_yellow_alt2_TooltipContent = n220 as Theme
export const light_yellow_alt2_SliderTrack = n220 as Theme
const n221 = t([
  [12, 87],
  [13, 88],
  [14, 89],
  [15, 91],
  [16, 86],
  [17, 85],
  [18, 94],
  [19, 93],
  [20, 94],
  [21, 93],
  [22, 95],
  [23, 91],
  [24, 92],
  [25, 91],
  [26, 91],
  [27, 91],
]) as Theme

export const light_yellow_alt2_Checkbox = n221 as Theme
export const light_yellow_alt2_RadioGroupItem = n221 as Theme
export const light_yellow_alt2_Input = n221 as Theme
export const light_yellow_alt2_TextArea = n221 as Theme
const n222 = t([
  [12, 95],
  [13, 94],
  [14, 93],
  [15, 92],
  [16, 11],
  [17, 11],
  [18, 86],
  [19, 87],
  [20, 86],
  [21, 87],
  [22, 84],
  [23, 94],
  [24, 93],
  [25, 94],
  [26, 94],
  [27, 87],
]) as Theme

export const light_yellow_alt2_SwitchThumb = n222 as Theme
const n223 = t([
  [12, 91],
  [13, 89],
  [14, 88],
  [15, 87],
  [16, 92],
  [17, 93],
  [18, 86],
  [19, 87],
  [20, 86],
  [21, 87],
  [22, 87],
  [23, 89],
  [24, 88],
  [25, 89],
  [26, 89],
  [27, 92],
]) as Theme

export const light_yellow_alt2_SliderTrackActive = n223 as Theme
const n224 = t([
  [12, 93],
  [13, 92],
  [14, 91],
  [15, 89],
  [16, 94],
  [17, 95],
  [18, 86],
  [19, 87],
  [20, 86],
  [21, 87],
  [22, 85],
  [23, 92],
  [24, 91],
  [25, 92],
  [26, 92],
  [27, 89],
]) as Theme

export const light_yellow_alt2_SliderThumb = n224 as Theme
export const light_yellow_alt2_Tooltip = n224 as Theme
export const light_yellow_alt2_ProgressIndicator = n224 as Theme
const n225 = t([
  [12, 87],
  [13, 88],
  [14, 89],
  [15, 91],
  [16, 86],
  [17, 85],
  [19, 92],
  [20, 93],
  [21, 92],
  [22, 95],
  [23, 88],
  [24, 89],
  [25, 88],
  [26, 88],
  [27, 91],
]) as Theme

export const light_yellow_active_ListItem = n225 as Theme
const n226 = t([
  [12, 89],
  [13, 91],
  [14, 92],
  [15, 93],
  [16, 88],
  [17, 87],
  [19, 92],
  [20, 93],
  [21, 92],
  [22, 93],
  [23, 91],
  [24, 92],
  [25, 91],
  [26, 91],
  [27, 88],
]) as Theme

export const light_yellow_active_Card = n226 as Theme
export const light_yellow_active_DrawerFrame = n226 as Theme
export const light_yellow_active_Progress = n226 as Theme
export const light_yellow_active_TooltipArrow = n226 as Theme
const n227 = t([
  [12, 91],
  [13, 92],
  [14, 93],
  [15, 94],
  [16, 89],
  [17, 88],
  [19, 92],
  [20, 93],
  [21, 92],
  [22, 92],
  [23, 91],
  [24, 92],
  [25, 91],
  [26, 91],
  [27, 87],
]) as Theme

export const light_yellow_active_Button = n227 as Theme
export const light_yellow_active_Switch = n227 as Theme
export const light_yellow_active_TooltipContent = n227 as Theme
export const light_yellow_active_SliderTrack = n227 as Theme
const n228 = t([
  [12, 88],
  [13, 89],
  [14, 91],
  [15, 92],
  [16, 87],
  [17, 86],
  [19, 92],
  [20, 93],
  [21, 92],
  [22, 94],
  [23, 92],
  [24, 93],
  [25, 92],
  [26, 92],
  [27, 89],
]) as Theme

export const light_yellow_active_Checkbox = n228 as Theme
export const light_yellow_active_RadioGroupItem = n228 as Theme
export const light_yellow_active_Input = n228 as Theme
export const light_yellow_active_TextArea = n228 as Theme
const n229 = t([
  [12, 94],
  [13, 93],
  [14, 92],
  [15, 91],
  [16, 95],
  [17, 11],
  [19, 88],
  [20, 87],
  [21, 88],
  [22, 84],
  [23, 93],
  [24, 92],
  [25, 93],
  [26, 93],
  [27, 88],
]) as Theme

export const light_yellow_active_SwitchThumb = n229 as Theme
const n230 = t([
  [12, 89],
  [13, 88],
  [14, 87],
  [15, 86],
  [16, 91],
  [17, 92],
  [19, 88],
  [20, 87],
  [21, 88],
  [22, 88],
  [23, 88],
  [24, 87],
  [25, 88],
  [26, 88],
  [27, 93],
]) as Theme

export const light_yellow_active_SliderTrackActive = n230 as Theme
const n231 = t([
  [12, 92],
  [13, 91],
  [14, 89],
  [15, 88],
  [16, 93],
  [17, 94],
  [19, 88],
  [20, 87],
  [21, 88],
  [22, 86],
  [23, 91],
  [24, 89],
  [25, 91],
  [26, 91],
  [27, 91],
]) as Theme

export const light_yellow_active_SliderThumb = n231 as Theme
export const light_yellow_active_Tooltip = n231 as Theme
export const light_yellow_active_ProgressIndicator = n231 as Theme
const n232 = t([
  [12, 37],
  [13, 38],
  [14, 39],
  [15, 40],
  [16, 36],
  [17, 36],
  [18, 47],
  [19, 46],
  [20, 47],
  [21, 46],
  [22, 11],
  [23, 39],
  [24, 40],
  [25, 39],
  [26, 39],
  [27, 45],
]) as Theme

export const light_green_alt1_ListItem = n232 as Theme
const n233 = t([
  [12, 39],
  [13, 40],
  [14, 41],
  [15, 43],
  [16, 38],
  [17, 37],
  [18, 47],
  [19, 46],
  [20, 47],
  [21, 46],
  [22, 47],
  [23, 41],
  [24, 43],
  [25, 41],
  [26, 41],
  [27, 43],
]) as Theme

export const light_green_alt1_Card = n233 as Theme
export const light_green_alt1_DrawerFrame = n233 as Theme
export const light_green_alt1_Progress = n233 as Theme
export const light_green_alt1_TooltipArrow = n233 as Theme
const n234 = t([
  [12, 40],
  [13, 41],
  [14, 43],
  [15, 44],
  [16, 39],
  [17, 38],
  [18, 47],
  [19, 46],
  [20, 47],
  [21, 46],
  [22, 46],
  [23, 41],
  [24, 43],
  [25, 41],
  [26, 41],
  [27, 41],
]) as Theme

export const light_green_alt1_Button = n234 as Theme
export const light_green_alt1_Switch = n234 as Theme
export const light_green_alt1_TooltipContent = n234 as Theme
export const light_green_alt1_SliderTrack = n234 as Theme
const n235 = t([
  [12, 38],
  [13, 39],
  [14, 40],
  [15, 41],
  [16, 37],
  [17, 36],
  [18, 47],
  [19, 46],
  [20, 47],
  [21, 46],
  [22, 11],
  [23, 43],
  [24, 44],
  [25, 43],
  [26, 43],
  [27, 44],
]) as Theme

export const light_green_alt1_Checkbox = n235 as Theme
export const light_green_alt1_RadioGroupItem = n235 as Theme
export const light_green_alt1_Input = n235 as Theme
export const light_green_alt1_TextArea = n235 as Theme
const n236 = t([
  [12, 11],
  [13, 47],
  [14, 46],
  [15, 45],
  [16, 11],
  [17, 11],
  [18, 37],
  [19, 38],
  [20, 37],
  [21, 38],
  [22, 36],
  [23, 46],
  [24, 45],
  [25, 46],
  [26, 46],
  [27, 38],
]) as Theme

export const light_green_alt1_SwitchThumb = n236 as Theme
const n237 = t([
  [12, 44],
  [13, 43],
  [14, 41],
  [15, 40],
  [16, 45],
  [17, 46],
  [18, 37],
  [19, 38],
  [20, 37],
  [21, 38],
  [22, 38],
  [23, 41],
  [24, 40],
  [25, 41],
  [26, 41],
  [27, 43],
]) as Theme

export const light_green_alt1_SliderTrackActive = n237 as Theme
const n238 = t([
  [12, 46],
  [13, 45],
  [14, 44],
  [15, 43],
  [16, 47],
  [17, 11],
  [18, 37],
  [19, 38],
  [20, 37],
  [21, 38],
  [22, 36],
  [23, 44],
  [24, 43],
  [25, 44],
  [26, 44],
  [27, 40],
]) as Theme

export const light_green_alt1_SliderThumb = n238 as Theme
export const light_green_alt1_Tooltip = n238 as Theme
export const light_green_alt1_ProgressIndicator = n238 as Theme
const n239 = t([
  [12, 38],
  [13, 39],
  [14, 40],
  [15, 41],
  [16, 37],
  [17, 36],
  [18, 46],
  [19, 45],
  [20, 46],
  [21, 45],
  [22, 11],
  [23, 39],
  [24, 40],
  [25, 39],
  [26, 39],
  [27, 44],
]) as Theme

export const light_green_alt2_ListItem = n239 as Theme
const n240 = t([
  [12, 40],
  [13, 41],
  [14, 43],
  [15, 44],
  [16, 39],
  [17, 38],
  [18, 46],
  [19, 45],
  [20, 46],
  [21, 45],
  [22, 46],
  [23, 41],
  [24, 43],
  [25, 41],
  [26, 41],
  [27, 41],
]) as Theme

export const light_green_alt2_Card = n240 as Theme
export const light_green_alt2_DrawerFrame = n240 as Theme
export const light_green_alt2_Progress = n240 as Theme
export const light_green_alt2_TooltipArrow = n240 as Theme
const n241 = t([
  [12, 41],
  [13, 43],
  [14, 44],
  [15, 45],
  [16, 40],
  [17, 39],
  [18, 46],
  [19, 45],
  [20, 46],
  [21, 45],
  [22, 45],
  [23, 41],
  [24, 43],
  [25, 41],
  [26, 41],
  [27, 40],
]) as Theme

export const light_green_alt2_Button = n241 as Theme
export const light_green_alt2_Switch = n241 as Theme
export const light_green_alt2_TooltipContent = n241 as Theme
export const light_green_alt2_SliderTrack = n241 as Theme
const n242 = t([
  [12, 39],
  [13, 40],
  [14, 41],
  [15, 43],
  [16, 38],
  [17, 37],
  [18, 46],
  [19, 45],
  [20, 46],
  [21, 45],
  [22, 47],
  [23, 43],
  [24, 44],
  [25, 43],
  [26, 43],
  [27, 43],
]) as Theme

export const light_green_alt2_Checkbox = n242 as Theme
export const light_green_alt2_RadioGroupItem = n242 as Theme
export const light_green_alt2_Input = n242 as Theme
export const light_green_alt2_TextArea = n242 as Theme
const n243 = t([
  [12, 47],
  [13, 46],
  [14, 45],
  [15, 44],
  [16, 11],
  [17, 11],
  [18, 38],
  [19, 39],
  [20, 38],
  [21, 39],
  [22, 36],
  [23, 46],
  [24, 45],
  [25, 46],
  [26, 46],
  [27, 39],
]) as Theme

export const light_green_alt2_SwitchThumb = n243 as Theme
const n244 = t([
  [12, 43],
  [13, 41],
  [14, 40],
  [15, 39],
  [16, 44],
  [17, 45],
  [18, 38],
  [19, 39],
  [20, 38],
  [21, 39],
  [22, 39],
  [23, 41],
  [24, 40],
  [25, 41],
  [26, 41],
  [27, 44],
]) as Theme

export const light_green_alt2_SliderTrackActive = n244 as Theme
const n245 = t([
  [12, 45],
  [13, 44],
  [14, 43],
  [15, 41],
  [16, 46],
  [17, 47],
  [18, 38],
  [19, 39],
  [20, 38],
  [21, 39],
  [22, 37],
  [23, 44],
  [24, 43],
  [25, 44],
  [26, 44],
  [27, 41],
]) as Theme

export const light_green_alt2_SliderThumb = n245 as Theme
export const light_green_alt2_Tooltip = n245 as Theme
export const light_green_alt2_ProgressIndicator = n245 as Theme
const n246 = t([
  [12, 39],
  [13, 40],
  [14, 41],
  [15, 43],
  [16, 38],
  [17, 37],
  [19, 44],
  [20, 45],
  [21, 44],
  [22, 47],
  [23, 40],
  [24, 41],
  [25, 40],
  [26, 40],
  [27, 43],
]) as Theme

export const light_green_active_ListItem = n246 as Theme
const n247 = t([
  [12, 41],
  [13, 43],
  [14, 44],
  [15, 45],
  [16, 40],
  [17, 39],
  [19, 44],
  [20, 45],
  [21, 44],
  [22, 45],
  [23, 43],
  [24, 44],
  [25, 43],
  [26, 43],
  [27, 40],
]) as Theme

export const light_green_active_Card = n247 as Theme
export const light_green_active_DrawerFrame = n247 as Theme
export const light_green_active_Progress = n247 as Theme
export const light_green_active_TooltipArrow = n247 as Theme
const n248 = t([
  [12, 43],
  [13, 44],
  [14, 45],
  [15, 46],
  [16, 41],
  [17, 40],
  [19, 44],
  [20, 45],
  [21, 44],
  [22, 44],
  [23, 43],
  [24, 44],
  [25, 43],
  [26, 43],
  [27, 39],
]) as Theme

export const light_green_active_Button = n248 as Theme
export const light_green_active_Switch = n248 as Theme
export const light_green_active_TooltipContent = n248 as Theme
export const light_green_active_SliderTrack = n248 as Theme
const n249 = t([
  [12, 40],
  [13, 41],
  [14, 43],
  [15, 44],
  [16, 39],
  [17, 38],
  [19, 44],
  [20, 45],
  [21, 44],
  [22, 46],
  [23, 44],
  [24, 45],
  [25, 44],
  [26, 44],
  [27, 41],
]) as Theme

export const light_green_active_Checkbox = n249 as Theme
export const light_green_active_RadioGroupItem = n249 as Theme
export const light_green_active_Input = n249 as Theme
export const light_green_active_TextArea = n249 as Theme
const n250 = t([
  [12, 46],
  [13, 45],
  [14, 44],
  [15, 43],
  [16, 47],
  [17, 11],
  [19, 40],
  [20, 39],
  [21, 40],
  [22, 36],
  [23, 45],
  [24, 44],
  [25, 45],
  [26, 45],
  [27, 40],
]) as Theme

export const light_green_active_SwitchThumb = n250 as Theme
const n251 = t([
  [12, 41],
  [13, 40],
  [14, 39],
  [15, 38],
  [16, 43],
  [17, 44],
  [19, 40],
  [20, 39],
  [21, 40],
  [22, 40],
  [23, 40],
  [24, 39],
  [25, 40],
  [26, 40],
  [27, 45],
]) as Theme

export const light_green_active_SliderTrackActive = n251 as Theme
const n252 = t([
  [12, 44],
  [13, 43],
  [14, 41],
  [15, 40],
  [16, 45],
  [17, 46],
  [19, 40],
  [20, 39],
  [21, 40],
  [22, 38],
  [23, 43],
  [24, 41],
  [25, 43],
  [26, 43],
  [27, 43],
]) as Theme

export const light_green_active_SliderThumb = n252 as Theme
export const light_green_active_Tooltip = n252 as Theme
export const light_green_active_ProgressIndicator = n252 as Theme
const n253 = t([
  [12, 15],
  [13, 16],
  [14, 17],
  [15, 18],
  [16, 14],
  [17, 14],
  [18, 25],
  [19, 24],
  [20, 25],
  [21, 24],
  [22, 11],
  [23, 17],
  [24, 18],
  [25, 17],
  [26, 17],
  [27, 23],
]) as Theme

export const light_blue_alt1_ListItem = n253 as Theme
const n254 = t([
  [12, 17],
  [13, 18],
  [14, 19],
  [15, 21],
  [16, 16],
  [17, 15],
  [18, 25],
  [19, 24],
  [20, 25],
  [21, 24],
  [22, 25],
  [23, 19],
  [24, 21],
  [25, 19],
  [26, 19],
  [27, 21],
]) as Theme

export const light_blue_alt1_Card = n254 as Theme
export const light_blue_alt1_DrawerFrame = n254 as Theme
export const light_blue_alt1_Progress = n254 as Theme
export const light_blue_alt1_TooltipArrow = n254 as Theme
const n255 = t([
  [12, 18],
  [13, 19],
  [14, 21],
  [15, 22],
  [16, 17],
  [17, 16],
  [18, 25],
  [19, 24],
  [20, 25],
  [21, 24],
  [22, 24],
  [23, 19],
  [24, 21],
  [25, 19],
  [26, 19],
  [27, 19],
]) as Theme

export const light_blue_alt1_Button = n255 as Theme
export const light_blue_alt1_Switch = n255 as Theme
export const light_blue_alt1_TooltipContent = n255 as Theme
export const light_blue_alt1_SliderTrack = n255 as Theme
const n256 = t([
  [12, 16],
  [13, 17],
  [14, 18],
  [15, 19],
  [16, 15],
  [17, 14],
  [18, 25],
  [19, 24],
  [20, 25],
  [21, 24],
  [22, 11],
  [23, 21],
  [24, 22],
  [25, 21],
  [26, 21],
  [27, 22],
]) as Theme

export const light_blue_alt1_Checkbox = n256 as Theme
export const light_blue_alt1_RadioGroupItem = n256 as Theme
export const light_blue_alt1_Input = n256 as Theme
export const light_blue_alt1_TextArea = n256 as Theme
const n257 = t([
  [12, 11],
  [13, 25],
  [14, 24],
  [15, 23],
  [16, 11],
  [17, 11],
  [18, 15],
  [19, 16],
  [20, 15],
  [21, 16],
  [22, 14],
  [23, 24],
  [24, 23],
  [25, 24],
  [26, 24],
  [27, 16],
]) as Theme

export const light_blue_alt1_SwitchThumb = n257 as Theme
const n258 = t([
  [12, 22],
  [13, 21],
  [14, 19],
  [15, 18],
  [16, 23],
  [17, 24],
  [18, 15],
  [19, 16],
  [20, 15],
  [21, 16],
  [22, 16],
  [23, 19],
  [24, 18],
  [25, 19],
  [26, 19],
  [27, 21],
]) as Theme

export const light_blue_alt1_SliderTrackActive = n258 as Theme
const n259 = t([
  [12, 24],
  [13, 23],
  [14, 22],
  [15, 21],
  [16, 25],
  [17, 11],
  [18, 15],
  [19, 16],
  [20, 15],
  [21, 16],
  [22, 14],
  [23, 22],
  [24, 21],
  [25, 22],
  [26, 22],
  [27, 18],
]) as Theme

export const light_blue_alt1_SliderThumb = n259 as Theme
export const light_blue_alt1_Tooltip = n259 as Theme
export const light_blue_alt1_ProgressIndicator = n259 as Theme
const n260 = t([
  [12, 16],
  [13, 17],
  [14, 18],
  [15, 19],
  [16, 15],
  [17, 14],
  [18, 24],
  [19, 23],
  [20, 24],
  [21, 23],
  [22, 11],
  [23, 17],
  [24, 18],
  [25, 17],
  [26, 17],
  [27, 22],
]) as Theme

export const light_blue_alt2_ListItem = n260 as Theme
const n261 = t([
  [12, 18],
  [13, 19],
  [14, 21],
  [15, 22],
  [16, 17],
  [17, 16],
  [18, 24],
  [19, 23],
  [20, 24],
  [21, 23],
  [22, 24],
  [23, 19],
  [24, 21],
  [25, 19],
  [26, 19],
  [27, 19],
]) as Theme

export const light_blue_alt2_Card = n261 as Theme
export const light_blue_alt2_DrawerFrame = n261 as Theme
export const light_blue_alt2_Progress = n261 as Theme
export const light_blue_alt2_TooltipArrow = n261 as Theme
const n262 = t([
  [12, 19],
  [13, 21],
  [14, 22],
  [15, 23],
  [16, 18],
  [17, 17],
  [18, 24],
  [19, 23],
  [20, 24],
  [21, 23],
  [22, 23],
  [23, 19],
  [24, 21],
  [25, 19],
  [26, 19],
  [27, 18],
]) as Theme

export const light_blue_alt2_Button = n262 as Theme
export const light_blue_alt2_Switch = n262 as Theme
export const light_blue_alt2_TooltipContent = n262 as Theme
export const light_blue_alt2_SliderTrack = n262 as Theme
const n263 = t([
  [12, 17],
  [13, 18],
  [14, 19],
  [15, 21],
  [16, 16],
  [17, 15],
  [18, 24],
  [19, 23],
  [20, 24],
  [21, 23],
  [22, 25],
  [23, 21],
  [24, 22],
  [25, 21],
  [26, 21],
  [27, 21],
]) as Theme

export const light_blue_alt2_Checkbox = n263 as Theme
export const light_blue_alt2_RadioGroupItem = n263 as Theme
export const light_blue_alt2_Input = n263 as Theme
export const light_blue_alt2_TextArea = n263 as Theme
const n264 = t([
  [12, 25],
  [13, 24],
  [14, 23],
  [15, 22],
  [16, 11],
  [17, 11],
  [18, 16],
  [19, 17],
  [20, 16],
  [21, 17],
  [22, 14],
  [23, 24],
  [24, 23],
  [25, 24],
  [26, 24],
  [27, 17],
]) as Theme

export const light_blue_alt2_SwitchThumb = n264 as Theme
const n265 = t([
  [12, 21],
  [13, 19],
  [14, 18],
  [15, 17],
  [16, 22],
  [17, 23],
  [18, 16],
  [19, 17],
  [20, 16],
  [21, 17],
  [22, 17],
  [23, 19],
  [24, 18],
  [25, 19],
  [26, 19],
  [27, 22],
]) as Theme

export const light_blue_alt2_SliderTrackActive = n265 as Theme
const n266 = t([
  [12, 23],
  [13, 22],
  [14, 21],
  [15, 19],
  [16, 24],
  [17, 25],
  [18, 16],
  [19, 17],
  [20, 16],
  [21, 17],
  [22, 15],
  [23, 22],
  [24, 21],
  [25, 22],
  [26, 22],
  [27, 19],
]) as Theme

export const light_blue_alt2_SliderThumb = n266 as Theme
export const light_blue_alt2_Tooltip = n266 as Theme
export const light_blue_alt2_ProgressIndicator = n266 as Theme
const n267 = t([
  [12, 17],
  [13, 18],
  [14, 19],
  [15, 21],
  [16, 16],
  [17, 15],
  [19, 22],
  [20, 23],
  [21, 22],
  [22, 25],
  [23, 18],
  [24, 19],
  [25, 18],
  [26, 18],
  [27, 21],
]) as Theme

export const light_blue_active_ListItem = n267 as Theme
const n268 = t([
  [12, 19],
  [13, 21],
  [14, 22],
  [15, 23],
  [16, 18],
  [17, 17],
  [19, 22],
  [20, 23],
  [21, 22],
  [22, 23],
  [23, 21],
  [24, 22],
  [25, 21],
  [26, 21],
  [27, 18],
]) as Theme

export const light_blue_active_Card = n268 as Theme
export const light_blue_active_DrawerFrame = n268 as Theme
export const light_blue_active_Progress = n268 as Theme
export const light_blue_active_TooltipArrow = n268 as Theme
const n269 = t([
  [12, 21],
  [13, 22],
  [14, 23],
  [15, 24],
  [16, 19],
  [17, 18],
  [19, 22],
  [20, 23],
  [21, 22],
  [22, 22],
  [23, 21],
  [24, 22],
  [25, 21],
  [26, 21],
  [27, 17],
]) as Theme

export const light_blue_active_Button = n269 as Theme
export const light_blue_active_Switch = n269 as Theme
export const light_blue_active_TooltipContent = n269 as Theme
export const light_blue_active_SliderTrack = n269 as Theme
const n270 = t([
  [12, 18],
  [13, 19],
  [14, 21],
  [15, 22],
  [16, 17],
  [17, 16],
  [19, 22],
  [20, 23],
  [21, 22],
  [22, 24],
  [23, 22],
  [24, 23],
  [25, 22],
  [26, 22],
  [27, 19],
]) as Theme

export const light_blue_active_Checkbox = n270 as Theme
export const light_blue_active_RadioGroupItem = n270 as Theme
export const light_blue_active_Input = n270 as Theme
export const light_blue_active_TextArea = n270 as Theme
const n271 = t([
  [12, 24],
  [13, 23],
  [14, 22],
  [15, 21],
  [16, 25],
  [17, 11],
  [19, 18],
  [20, 17],
  [21, 18],
  [22, 14],
  [23, 23],
  [24, 22],
  [25, 23],
  [26, 23],
  [27, 18],
]) as Theme

export const light_blue_active_SwitchThumb = n271 as Theme
const n272 = t([
  [12, 19],
  [13, 18],
  [14, 17],
  [15, 16],
  [16, 21],
  [17, 22],
  [19, 18],
  [20, 17],
  [21, 18],
  [22, 18],
  [23, 18],
  [24, 17],
  [25, 18],
  [26, 18],
  [27, 23],
]) as Theme

export const light_blue_active_SliderTrackActive = n272 as Theme
const n273 = t([
  [12, 22],
  [13, 21],
  [14, 19],
  [15, 18],
  [16, 23],
  [17, 24],
  [19, 18],
  [20, 17],
  [21, 18],
  [22, 16],
  [23, 21],
  [24, 19],
  [25, 21],
  [26, 21],
  [27, 21],
]) as Theme

export const light_blue_active_SliderThumb = n273 as Theme
export const light_blue_active_Tooltip = n273 as Theme
export const light_blue_active_ProgressIndicator = n273 as Theme
const n274 = t([
  [12, 61],
  [13, 62],
  [14, 63],
  [15, 64],
  [16, 60],
  [17, 60],
  [18, 71],
  [19, 70],
  [20, 71],
  [21, 70],
  [22, 11],
  [23, 63],
  [24, 64],
  [25, 63],
  [26, 63],
  [27, 69],
]) as Theme

export const light_mint_alt1_ListItem = n274 as Theme
const n275 = t([
  [12, 63],
  [13, 64],
  [14, 65],
  [15, 67],
  [16, 62],
  [17, 61],
  [18, 71],
  [19, 70],
  [20, 71],
  [21, 70],
  [22, 71],
  [23, 65],
  [24, 67],
  [25, 65],
  [26, 65],
  [27, 67],
]) as Theme

export const light_mint_alt1_Card = n275 as Theme
export const light_mint_alt1_DrawerFrame = n275 as Theme
export const light_mint_alt1_Progress = n275 as Theme
export const light_mint_alt1_TooltipArrow = n275 as Theme
const n276 = t([
  [12, 64],
  [13, 65],
  [14, 67],
  [15, 68],
  [16, 63],
  [17, 62],
  [18, 71],
  [19, 70],
  [20, 71],
  [21, 70],
  [22, 70],
  [23, 65],
  [24, 67],
  [25, 65],
  [26, 65],
  [27, 65],
]) as Theme

export const light_mint_alt1_Button = n276 as Theme
export const light_mint_alt1_Switch = n276 as Theme
export const light_mint_alt1_TooltipContent = n276 as Theme
export const light_mint_alt1_SliderTrack = n276 as Theme
const n277 = t([
  [12, 62],
  [13, 63],
  [14, 64],
  [15, 65],
  [16, 61],
  [17, 60],
  [18, 71],
  [19, 70],
  [20, 71],
  [21, 70],
  [22, 11],
  [23, 67],
  [24, 68],
  [25, 67],
  [26, 67],
  [27, 68],
]) as Theme

export const light_mint_alt1_Checkbox = n277 as Theme
export const light_mint_alt1_RadioGroupItem = n277 as Theme
export const light_mint_alt1_Input = n277 as Theme
export const light_mint_alt1_TextArea = n277 as Theme
const n278 = t([
  [12, 11],
  [13, 71],
  [14, 70],
  [15, 69],
  [16, 11],
  [17, 11],
  [18, 61],
  [19, 62],
  [20, 61],
  [21, 62],
  [22, 60],
  [23, 70],
  [24, 69],
  [25, 70],
  [26, 70],
  [27, 62],
]) as Theme

export const light_mint_alt1_SwitchThumb = n278 as Theme
const n279 = t([
  [12, 68],
  [13, 67],
  [14, 65],
  [15, 64],
  [16, 69],
  [17, 70],
  [18, 61],
  [19, 62],
  [20, 61],
  [21, 62],
  [22, 62],
  [23, 65],
  [24, 64],
  [25, 65],
  [26, 65],
  [27, 67],
]) as Theme

export const light_mint_alt1_SliderTrackActive = n279 as Theme
const n280 = t([
  [12, 70],
  [13, 69],
  [14, 68],
  [15, 67],
  [16, 71],
  [17, 11],
  [18, 61],
  [19, 62],
  [20, 61],
  [21, 62],
  [22, 60],
  [23, 68],
  [24, 67],
  [25, 68],
  [26, 68],
  [27, 64],
]) as Theme

export const light_mint_alt1_SliderThumb = n280 as Theme
export const light_mint_alt1_Tooltip = n280 as Theme
export const light_mint_alt1_ProgressIndicator = n280 as Theme
const n281 = t([
  [12, 62],
  [13, 63],
  [14, 64],
  [15, 65],
  [16, 61],
  [17, 60],
  [18, 70],
  [19, 69],
  [20, 70],
  [21, 69],
  [22, 11],
  [23, 63],
  [24, 64],
  [25, 63],
  [26, 63],
  [27, 68],
]) as Theme

export const light_mint_alt2_ListItem = n281 as Theme
const n282 = t([
  [12, 64],
  [13, 65],
  [14, 67],
  [15, 68],
  [16, 63],
  [17, 62],
  [18, 70],
  [19, 69],
  [20, 70],
  [21, 69],
  [22, 70],
  [23, 65],
  [24, 67],
  [25, 65],
  [26, 65],
  [27, 65],
]) as Theme

export const light_mint_alt2_Card = n282 as Theme
export const light_mint_alt2_DrawerFrame = n282 as Theme
export const light_mint_alt2_Progress = n282 as Theme
export const light_mint_alt2_TooltipArrow = n282 as Theme
const n283 = t([
  [12, 65],
  [13, 67],
  [14, 68],
  [15, 69],
  [16, 64],
  [17, 63],
  [18, 70],
  [19, 69],
  [20, 70],
  [21, 69],
  [22, 69],
  [23, 65],
  [24, 67],
  [25, 65],
  [26, 65],
  [27, 64],
]) as Theme

export const light_mint_alt2_Button = n283 as Theme
export const light_mint_alt2_Switch = n283 as Theme
export const light_mint_alt2_TooltipContent = n283 as Theme
export const light_mint_alt2_SliderTrack = n283 as Theme
const n284 = t([
  [12, 63],
  [13, 64],
  [14, 65],
  [15, 67],
  [16, 62],
  [17, 61],
  [18, 70],
  [19, 69],
  [20, 70],
  [21, 69],
  [22, 71],
  [23, 67],
  [24, 68],
  [25, 67],
  [26, 67],
  [27, 67],
]) as Theme

export const light_mint_alt2_Checkbox = n284 as Theme
export const light_mint_alt2_RadioGroupItem = n284 as Theme
export const light_mint_alt2_Input = n284 as Theme
export const light_mint_alt2_TextArea = n284 as Theme
const n285 = t([
  [12, 71],
  [13, 70],
  [14, 69],
  [15, 68],
  [16, 11],
  [17, 11],
  [18, 62],
  [19, 63],
  [20, 62],
  [21, 63],
  [22, 60],
  [23, 70],
  [24, 69],
  [25, 70],
  [26, 70],
  [27, 63],
]) as Theme

export const light_mint_alt2_SwitchThumb = n285 as Theme
const n286 = t([
  [12, 67],
  [13, 65],
  [14, 64],
  [15, 63],
  [16, 68],
  [17, 69],
  [18, 62],
  [19, 63],
  [20, 62],
  [21, 63],
  [22, 63],
  [23, 65],
  [24, 64],
  [25, 65],
  [26, 65],
  [27, 68],
]) as Theme

export const light_mint_alt2_SliderTrackActive = n286 as Theme
const n287 = t([
  [12, 69],
  [13, 68],
  [14, 67],
  [15, 65],
  [16, 70],
  [17, 71],
  [18, 62],
  [19, 63],
  [20, 62],
  [21, 63],
  [22, 61],
  [23, 68],
  [24, 67],
  [25, 68],
  [26, 68],
  [27, 65],
]) as Theme

export const light_mint_alt2_SliderThumb = n287 as Theme
export const light_mint_alt2_Tooltip = n287 as Theme
export const light_mint_alt2_ProgressIndicator = n287 as Theme
const n288 = t([
  [12, 63],
  [13, 64],
  [14, 65],
  [15, 67],
  [16, 62],
  [17, 61],
  [19, 68],
  [20, 69],
  [21, 68],
  [22, 71],
  [23, 64],
  [24, 65],
  [25, 64],
  [26, 64],
  [27, 67],
]) as Theme

export const light_mint_active_ListItem = n288 as Theme
const n289 = t([
  [12, 65],
  [13, 67],
  [14, 68],
  [15, 69],
  [16, 64],
  [17, 63],
  [19, 68],
  [20, 69],
  [21, 68],
  [22, 69],
  [23, 67],
  [24, 68],
  [25, 67],
  [26, 67],
  [27, 64],
]) as Theme

export const light_mint_active_Card = n289 as Theme
export const light_mint_active_DrawerFrame = n289 as Theme
export const light_mint_active_Progress = n289 as Theme
export const light_mint_active_TooltipArrow = n289 as Theme
const n290 = t([
  [12, 67],
  [13, 68],
  [14, 69],
  [15, 70],
  [16, 65],
  [17, 64],
  [19, 68],
  [20, 69],
  [21, 68],
  [22, 68],
  [23, 67],
  [24, 68],
  [25, 67],
  [26, 67],
  [27, 63],
]) as Theme

export const light_mint_active_Button = n290 as Theme
export const light_mint_active_Switch = n290 as Theme
export const light_mint_active_TooltipContent = n290 as Theme
export const light_mint_active_SliderTrack = n290 as Theme
const n291 = t([
  [12, 64],
  [13, 65],
  [14, 67],
  [15, 68],
  [16, 63],
  [17, 62],
  [19, 68],
  [20, 69],
  [21, 68],
  [22, 70],
  [23, 68],
  [24, 69],
  [25, 68],
  [26, 68],
  [27, 65],
]) as Theme

export const light_mint_active_Checkbox = n291 as Theme
export const light_mint_active_RadioGroupItem = n291 as Theme
export const light_mint_active_Input = n291 as Theme
export const light_mint_active_TextArea = n291 as Theme
const n292 = t([
  [12, 70],
  [13, 69],
  [14, 68],
  [15, 67],
  [16, 71],
  [17, 11],
  [19, 64],
  [20, 63],
  [21, 64],
  [22, 60],
  [23, 69],
  [24, 68],
  [25, 69],
  [26, 69],
  [27, 64],
]) as Theme

export const light_mint_active_SwitchThumb = n292 as Theme
const n293 = t([
  [12, 65],
  [13, 64],
  [14, 63],
  [15, 62],
  [16, 67],
  [17, 68],
  [19, 64],
  [20, 63],
  [21, 64],
  [22, 64],
  [23, 64],
  [24, 63],
  [25, 64],
  [26, 64],
  [27, 69],
]) as Theme

export const light_mint_active_SliderTrackActive = n293 as Theme
const n294 = t([
  [12, 68],
  [13, 67],
  [14, 65],
  [15, 64],
  [16, 69],
  [17, 70],
  [19, 64],
  [20, 63],
  [21, 64],
  [22, 62],
  [23, 67],
  [24, 65],
  [25, 67],
  [26, 67],
  [27, 67],
]) as Theme

export const light_mint_active_SliderThumb = n294 as Theme
export const light_mint_active_Tooltip = n294 as Theme
export const light_mint_active_ProgressIndicator = n294 as Theme
const n295 = t([
  [12, 73],
  [13, 74],
  [14, 75],
  [15, 76],
  [16, 72],
  [17, 72],
  [18, 83],
  [19, 82],
  [20, 83],
  [21, 82],
  [22, 11],
  [23, 75],
  [24, 76],
  [25, 75],
  [26, 75],
  [27, 81],
]) as Theme

export const light_red_alt1_ListItem = n295 as Theme
const n296 = t([
  [12, 75],
  [13, 76],
  [14, 77],
  [15, 79],
  [16, 74],
  [17, 73],
  [18, 83],
  [19, 82],
  [20, 83],
  [21, 82],
  [22, 83],
  [23, 77],
  [24, 79],
  [25, 77],
  [26, 77],
  [27, 79],
]) as Theme

export const light_red_alt1_Card = n296 as Theme
export const light_red_alt1_DrawerFrame = n296 as Theme
export const light_red_alt1_Progress = n296 as Theme
export const light_red_alt1_TooltipArrow = n296 as Theme
const n297 = t([
  [12, 76],
  [13, 77],
  [14, 79],
  [15, 80],
  [16, 75],
  [17, 74],
  [18, 83],
  [19, 82],
  [20, 83],
  [21, 82],
  [22, 82],
  [23, 77],
  [24, 79],
  [25, 77],
  [26, 77],
  [27, 77],
]) as Theme

export const light_red_alt1_Button = n297 as Theme
export const light_red_alt1_Switch = n297 as Theme
export const light_red_alt1_TooltipContent = n297 as Theme
export const light_red_alt1_SliderTrack = n297 as Theme
const n298 = t([
  [12, 74],
  [13, 75],
  [14, 76],
  [15, 77],
  [16, 73],
  [17, 72],
  [18, 83],
  [19, 82],
  [20, 83],
  [21, 82],
  [22, 11],
  [23, 79],
  [24, 80],
  [25, 79],
  [26, 79],
  [27, 80],
]) as Theme

export const light_red_alt1_Checkbox = n298 as Theme
export const light_red_alt1_RadioGroupItem = n298 as Theme
export const light_red_alt1_Input = n298 as Theme
export const light_red_alt1_TextArea = n298 as Theme
const n299 = t([
  [12, 11],
  [13, 83],
  [14, 82],
  [15, 81],
  [16, 11],
  [17, 11],
  [18, 73],
  [19, 74],
  [20, 73],
  [21, 74],
  [22, 72],
  [23, 82],
  [24, 81],
  [25, 82],
  [26, 82],
  [27, 74],
]) as Theme

export const light_red_alt1_SwitchThumb = n299 as Theme
const n300 = t([
  [12, 80],
  [13, 79],
  [14, 77],
  [15, 76],
  [16, 81],
  [17, 82],
  [18, 73],
  [19, 74],
  [20, 73],
  [21, 74],
  [22, 74],
  [23, 77],
  [24, 76],
  [25, 77],
  [26, 77],
  [27, 79],
]) as Theme

export const light_red_alt1_SliderTrackActive = n300 as Theme
const n301 = t([
  [12, 82],
  [13, 81],
  [14, 80],
  [15, 79],
  [16, 83],
  [17, 11],
  [18, 73],
  [19, 74],
  [20, 73],
  [21, 74],
  [22, 72],
  [23, 80],
  [24, 79],
  [25, 80],
  [26, 80],
  [27, 76],
]) as Theme

export const light_red_alt1_SliderThumb = n301 as Theme
export const light_red_alt1_Tooltip = n301 as Theme
export const light_red_alt1_ProgressIndicator = n301 as Theme
const n302 = t([
  [12, 74],
  [13, 75],
  [14, 76],
  [15, 77],
  [16, 73],
  [17, 72],
  [18, 82],
  [19, 81],
  [20, 82],
  [21, 81],
  [22, 11],
  [23, 75],
  [24, 76],
  [25, 75],
  [26, 75],
  [27, 80],
]) as Theme

export const light_red_alt2_ListItem = n302 as Theme
const n303 = t([
  [12, 76],
  [13, 77],
  [14, 79],
  [15, 80],
  [16, 75],
  [17, 74],
  [18, 82],
  [19, 81],
  [20, 82],
  [21, 81],
  [22, 82],
  [23, 77],
  [24, 79],
  [25, 77],
  [26, 77],
  [27, 77],
]) as Theme

export const light_red_alt2_Card = n303 as Theme
export const light_red_alt2_DrawerFrame = n303 as Theme
export const light_red_alt2_Progress = n303 as Theme
export const light_red_alt2_TooltipArrow = n303 as Theme
const n304 = t([
  [12, 77],
  [13, 79],
  [14, 80],
  [15, 81],
  [16, 76],
  [17, 75],
  [18, 82],
  [19, 81],
  [20, 82],
  [21, 81],
  [22, 81],
  [23, 77],
  [24, 79],
  [25, 77],
  [26, 77],
  [27, 76],
]) as Theme

export const light_red_alt2_Button = n304 as Theme
export const light_red_alt2_Switch = n304 as Theme
export const light_red_alt2_TooltipContent = n304 as Theme
export const light_red_alt2_SliderTrack = n304 as Theme
const n305 = t([
  [12, 75],
  [13, 76],
  [14, 77],
  [15, 79],
  [16, 74],
  [17, 73],
  [18, 82],
  [19, 81],
  [20, 82],
  [21, 81],
  [22, 83],
  [23, 79],
  [24, 80],
  [25, 79],
  [26, 79],
  [27, 79],
]) as Theme

export const light_red_alt2_Checkbox = n305 as Theme
export const light_red_alt2_RadioGroupItem = n305 as Theme
export const light_red_alt2_Input = n305 as Theme
export const light_red_alt2_TextArea = n305 as Theme
const n306 = t([
  [12, 83],
  [13, 82],
  [14, 81],
  [15, 80],
  [16, 11],
  [17, 11],
  [18, 74],
  [19, 75],
  [20, 74],
  [21, 75],
  [22, 72],
  [23, 82],
  [24, 81],
  [25, 82],
  [26, 82],
  [27, 75],
]) as Theme

export const light_red_alt2_SwitchThumb = n306 as Theme
const n307 = t([
  [12, 79],
  [13, 77],
  [14, 76],
  [15, 75],
  [16, 80],
  [17, 81],
  [18, 74],
  [19, 75],
  [20, 74],
  [21, 75],
  [22, 75],
  [23, 77],
  [24, 76],
  [25, 77],
  [26, 77],
  [27, 80],
]) as Theme

export const light_red_alt2_SliderTrackActive = n307 as Theme
const n308 = t([
  [12, 81],
  [13, 80],
  [14, 79],
  [15, 77],
  [16, 82],
  [17, 83],
  [18, 74],
  [19, 75],
  [20, 74],
  [21, 75],
  [22, 73],
  [23, 80],
  [24, 79],
  [25, 80],
  [26, 80],
  [27, 77],
]) as Theme

export const light_red_alt2_SliderThumb = n308 as Theme
export const light_red_alt2_Tooltip = n308 as Theme
export const light_red_alt2_ProgressIndicator = n308 as Theme
const n309 = t([
  [12, 75],
  [13, 76],
  [14, 77],
  [15, 79],
  [16, 74],
  [17, 73],
  [19, 80],
  [20, 81],
  [21, 80],
  [22, 83],
  [23, 76],
  [24, 77],
  [25, 76],
  [26, 76],
  [27, 79],
]) as Theme

export const light_red_active_ListItem = n309 as Theme
const n310 = t([
  [12, 77],
  [13, 79],
  [14, 80],
  [15, 81],
  [16, 76],
  [17, 75],
  [19, 80],
  [20, 81],
  [21, 80],
  [22, 81],
  [23, 79],
  [24, 80],
  [25, 79],
  [26, 79],
  [27, 76],
]) as Theme

export const light_red_active_Card = n310 as Theme
export const light_red_active_DrawerFrame = n310 as Theme
export const light_red_active_Progress = n310 as Theme
export const light_red_active_TooltipArrow = n310 as Theme
const n311 = t([
  [12, 79],
  [13, 80],
  [14, 81],
  [15, 82],
  [16, 77],
  [17, 76],
  [19, 80],
  [20, 81],
  [21, 80],
  [22, 80],
  [23, 79],
  [24, 80],
  [25, 79],
  [26, 79],
  [27, 75],
]) as Theme

export const light_red_active_Button = n311 as Theme
export const light_red_active_Switch = n311 as Theme
export const light_red_active_TooltipContent = n311 as Theme
export const light_red_active_SliderTrack = n311 as Theme
const n312 = t([
  [12, 76],
  [13, 77],
  [14, 79],
  [15, 80],
  [16, 75],
  [17, 74],
  [19, 80],
  [20, 81],
  [21, 80],
  [22, 82],
  [23, 80],
  [24, 81],
  [25, 80],
  [26, 80],
  [27, 77],
]) as Theme

export const light_red_active_Checkbox = n312 as Theme
export const light_red_active_RadioGroupItem = n312 as Theme
export const light_red_active_Input = n312 as Theme
export const light_red_active_TextArea = n312 as Theme
const n313 = t([
  [12, 82],
  [13, 81],
  [14, 80],
  [15, 79],
  [16, 83],
  [17, 11],
  [19, 76],
  [20, 75],
  [21, 76],
  [22, 72],
  [23, 81],
  [24, 80],
  [25, 81],
  [26, 81],
  [27, 76],
]) as Theme

export const light_red_active_SwitchThumb = n313 as Theme
const n314 = t([
  [12, 77],
  [13, 76],
  [14, 75],
  [15, 74],
  [16, 79],
  [17, 80],
  [19, 76],
  [20, 75],
  [21, 76],
  [22, 76],
  [23, 76],
  [24, 75],
  [25, 76],
  [26, 76],
  [27, 81],
]) as Theme

export const light_red_active_SliderTrackActive = n314 as Theme
const n315 = t([
  [12, 80],
  [13, 79],
  [14, 77],
  [15, 76],
  [16, 81],
  [17, 82],
  [19, 76],
  [20, 75],
  [21, 76],
  [22, 74],
  [23, 79],
  [24, 77],
  [25, 79],
  [26, 79],
  [27, 79],
]) as Theme

export const light_red_active_SliderThumb = n315 as Theme
export const light_red_active_Tooltip = n315 as Theme
export const light_red_active_ProgressIndicator = n315 as Theme
const n316 = t([
  [12, 145],
  [13, 146],
  [14, 147],
  [15, 149],
  [16, 144],
  [17, 143],
  [18, 152],
  [19, 151],
  [20, 152],
  [21, 151],
  [22, 152],
  [23, 149],
  [24, 56],
  [25, 147],
  [26, 149],
  [27, 149],
]) as Theme

export const dark_orange_alt1_Card = n316 as Theme
export const dark_orange_alt1_DrawerFrame = n316 as Theme
export const dark_orange_alt1_Progress = n316 as Theme
export const dark_orange_alt1_TooltipArrow = n316 as Theme
const n317 = t([
  [12, 146],
  [13, 147],
  [14, 149],
  [15, 56],
  [16, 145],
  [17, 144],
  [18, 152],
  [19, 151],
  [20, 152],
  [21, 151],
  [22, 151],
  [23, 149],
  [24, 56],
  [25, 147],
  [26, 149],
  [27, 147],
]) as Theme

export const dark_orange_alt1_Button = n317 as Theme
export const dark_orange_alt1_Switch = n317 as Theme
export const dark_orange_alt1_TooltipContent = n317 as Theme
export const dark_orange_alt1_SliderTrack = n317 as Theme
const n318 = t([
  [12, 144],
  [13, 145],
  [14, 146],
  [15, 147],
  [16, 143],
  [17, 142],
  [18, 152],
  [19, 151],
  [20, 152],
  [21, 151],
  [22, 0],
  [23, 56],
  [24, 150],
  [25, 149],
  [26, 56],
  [27, 56],
]) as Theme

export const dark_orange_alt1_Checkbox = n318 as Theme
export const dark_orange_alt1_RadioGroupItem = n318 as Theme
export const dark_orange_alt1_Input = n318 as Theme
export const dark_orange_alt1_TextArea = n318 as Theme
const n319 = t([
  [12, 0],
  [13, 152],
  [14, 151],
  [15, 150],
  [16, 0],
  [17, 0],
  [18, 143],
  [19, 144],
  [20, 143],
  [21, 144],
  [22, 142],
  [23, 150],
  [24, 56],
  [25, 151],
  [26, 150],
  [27, 144],
]) as Theme

export const dark_orange_alt1_SwitchThumb = n319 as Theme
const n320 = t([
  [12, 56],
  [13, 149],
  [14, 147],
  [15, 146],
  [16, 150],
  [17, 151],
  [18, 143],
  [19, 144],
  [20, 143],
  [21, 144],
  [22, 144],
  [23, 146],
  [24, 145],
  [25, 147],
  [26, 146],
  [27, 149],
]) as Theme

export const dark_orange_alt1_SliderTrackActive = n320 as Theme
const n321 = t([
  [12, 151],
  [13, 150],
  [14, 56],
  [15, 149],
  [16, 152],
  [17, 0],
  [18, 143],
  [19, 144],
  [20, 143],
  [21, 144],
  [22, 142],
  [23, 149],
  [24, 147],
  [25, 56],
  [26, 149],
  [27, 146],
]) as Theme

export const dark_orange_alt1_SliderThumb = n321 as Theme
export const dark_orange_alt1_Tooltip = n321 as Theme
export const dark_orange_alt1_ProgressIndicator = n321 as Theme
const n322 = t([
  [12, 146],
  [13, 147],
  [14, 149],
  [15, 56],
  [16, 145],
  [17, 144],
  [18, 151],
  [19, 150],
  [20, 151],
  [21, 150],
  [22, 151],
  [23, 149],
  [24, 56],
  [25, 147],
  [26, 149],
  [27, 147],
]) as Theme

export const dark_orange_alt2_Card = n322 as Theme
export const dark_orange_alt2_DrawerFrame = n322 as Theme
export const dark_orange_alt2_Progress = n322 as Theme
export const dark_orange_alt2_TooltipArrow = n322 as Theme
const n323 = t([
  [12, 147],
  [13, 149],
  [14, 56],
  [15, 150],
  [16, 146],
  [17, 145],
  [18, 151],
  [19, 150],
  [20, 151],
  [21, 150],
  [22, 150],
  [23, 149],
  [24, 56],
  [25, 147],
  [26, 149],
  [27, 146],
]) as Theme

export const dark_orange_alt2_Button = n323 as Theme
export const dark_orange_alt2_Switch = n323 as Theme
export const dark_orange_alt2_TooltipContent = n323 as Theme
export const dark_orange_alt2_SliderTrack = n323 as Theme
const n324 = t([
  [12, 145],
  [13, 146],
  [14, 147],
  [15, 149],
  [16, 144],
  [17, 143],
  [18, 151],
  [19, 150],
  [20, 151],
  [21, 150],
  [22, 152],
  [23, 56],
  [24, 150],
  [25, 149],
  [26, 56],
  [27, 149],
]) as Theme

export const dark_orange_alt2_Checkbox = n324 as Theme
export const dark_orange_alt2_RadioGroupItem = n324 as Theme
export const dark_orange_alt2_Input = n324 as Theme
export const dark_orange_alt2_TextArea = n324 as Theme
const n325 = t([
  [12, 152],
  [13, 151],
  [14, 150],
  [15, 56],
  [16, 0],
  [17, 0],
  [18, 144],
  [19, 145],
  [20, 144],
  [21, 145],
  [22, 142],
  [23, 150],
  [24, 56],
  [25, 151],
  [26, 150],
  [27, 145],
]) as Theme

export const dark_orange_alt2_SwitchThumb = n325 as Theme
const n326 = t([
  [12, 149],
  [13, 147],
  [14, 146],
  [15, 145],
  [16, 56],
  [17, 150],
  [18, 144],
  [19, 145],
  [20, 144],
  [21, 145],
  [22, 145],
  [23, 146],
  [24, 145],
  [25, 147],
  [26, 146],
  [27, 56],
]) as Theme

export const dark_orange_alt2_SliderTrackActive = n326 as Theme
const n327 = t([
  [12, 150],
  [13, 56],
  [14, 149],
  [15, 147],
  [16, 151],
  [17, 152],
  [18, 144],
  [19, 145],
  [20, 144],
  [21, 145],
  [22, 143],
  [23, 149],
  [24, 147],
  [25, 56],
  [26, 149],
  [27, 147],
]) as Theme

export const dark_orange_alt2_SliderThumb = n327 as Theme
export const dark_orange_alt2_Tooltip = n327 as Theme
export const dark_orange_alt2_ProgressIndicator = n327 as Theme
const n328 = t([
  [12, 147],
  [13, 149],
  [14, 56],
  [15, 150],
  [16, 146],
  [17, 145],
  [19, 56],
  [20, 150],
  [21, 56],
  [22, 150],
  [23, 56],
  [24, 150],
  [25, 149],
  [26, 56],
  [27, 146],
]) as Theme

export const dark_orange_active_Card = n328 as Theme
export const dark_orange_active_DrawerFrame = n328 as Theme
export const dark_orange_active_Progress = n328 as Theme
export const dark_orange_active_TooltipArrow = n328 as Theme
const n329 = t([
  [12, 149],
  [13, 56],
  [14, 150],
  [15, 151],
  [16, 147],
  [17, 146],
  [19, 56],
  [20, 150],
  [21, 56],
  [22, 56],
  [23, 56],
  [24, 150],
  [25, 149],
  [26, 56],
  [27, 145],
]) as Theme

export const dark_orange_active_Button = n329 as Theme
export const dark_orange_active_Switch = n329 as Theme
export const dark_orange_active_TooltipContent = n329 as Theme
export const dark_orange_active_SliderTrack = n329 as Theme
const n330 = t([
  [12, 146],
  [13, 147],
  [14, 149],
  [15, 56],
  [16, 145],
  [17, 144],
  [19, 56],
  [20, 150],
  [21, 56],
  [22, 151],
  [23, 150],
  [24, 151],
  [25, 56],
  [26, 150],
  [27, 147],
]) as Theme

export const dark_orange_active_Checkbox = n330 as Theme
export const dark_orange_active_RadioGroupItem = n330 as Theme
export const dark_orange_active_Input = n330 as Theme
export const dark_orange_active_TextArea = n330 as Theme
const n331 = t([
  [12, 151],
  [13, 150],
  [14, 56],
  [15, 149],
  [16, 152],
  [17, 0],
  [19, 146],
  [20, 145],
  [21, 146],
  [22, 142],
  [23, 56],
  [24, 149],
  [25, 150],
  [26, 56],
  [27, 146],
]) as Theme

export const dark_orange_active_SwitchThumb = n331 as Theme
const n332 = t([
  [12, 147],
  [13, 146],
  [14, 145],
  [15, 144],
  [16, 149],
  [17, 56],
  [19, 146],
  [20, 145],
  [21, 146],
  [22, 146],
  [23, 145],
  [24, 144],
  [25, 146],
  [26, 145],
  [27, 150],
]) as Theme

export const dark_orange_active_SliderTrackActive = n332 as Theme
const n333 = t([
  [12, 56],
  [13, 149],
  [14, 147],
  [15, 146],
  [16, 150],
  [17, 151],
  [19, 146],
  [20, 145],
  [21, 146],
  [22, 144],
  [23, 147],
  [24, 146],
  [25, 149],
  [26, 147],
  [27, 149],
]) as Theme

export const dark_orange_active_SliderThumb = n333 as Theme
export const dark_orange_active_Tooltip = n333 as Theme
export const dark_orange_active_ProgressIndicator = n333 as Theme
const n334 = t([
  [12, 178],
  [13, 179],
  [14, 180],
  [15, 182],
  [16, 177],
  [17, 176],
  [18, 185],
  [19, 184],
  [20, 185],
  [21, 184],
  [22, 185],
  [23, 182],
  [24, 92],
  [25, 180],
  [26, 182],
  [27, 182],
]) as Theme

export const dark_yellow_alt1_Card = n334 as Theme
export const dark_yellow_alt1_DrawerFrame = n334 as Theme
export const dark_yellow_alt1_Progress = n334 as Theme
export const dark_yellow_alt1_TooltipArrow = n334 as Theme
const n335 = t([
  [12, 179],
  [13, 180],
  [14, 182],
  [15, 92],
  [16, 178],
  [17, 177],
  [18, 185],
  [19, 184],
  [20, 185],
  [21, 184],
  [22, 184],
  [23, 182],
  [24, 92],
  [25, 180],
  [26, 182],
  [27, 180],
]) as Theme

export const dark_yellow_alt1_Button = n335 as Theme
export const dark_yellow_alt1_Switch = n335 as Theme
export const dark_yellow_alt1_TooltipContent = n335 as Theme
export const dark_yellow_alt1_SliderTrack = n335 as Theme
const n336 = t([
  [12, 177],
  [13, 178],
  [14, 179],
  [15, 180],
  [16, 176],
  [17, 175],
  [18, 185],
  [19, 184],
  [20, 185],
  [21, 184],
  [22, 0],
  [23, 92],
  [24, 183],
  [25, 182],
  [26, 92],
  [27, 92],
]) as Theme

export const dark_yellow_alt1_Checkbox = n336 as Theme
export const dark_yellow_alt1_RadioGroupItem = n336 as Theme
export const dark_yellow_alt1_Input = n336 as Theme
export const dark_yellow_alt1_TextArea = n336 as Theme
const n337 = t([
  [12, 0],
  [13, 185],
  [14, 184],
  [15, 183],
  [16, 0],
  [17, 0],
  [18, 176],
  [19, 177],
  [20, 176],
  [21, 177],
  [22, 175],
  [23, 183],
  [24, 92],
  [25, 184],
  [26, 183],
  [27, 177],
]) as Theme

export const dark_yellow_alt1_SwitchThumb = n337 as Theme
const n338 = t([
  [12, 92],
  [13, 182],
  [14, 180],
  [15, 179],
  [16, 183],
  [17, 184],
  [18, 176],
  [19, 177],
  [20, 176],
  [21, 177],
  [22, 177],
  [23, 179],
  [24, 178],
  [25, 180],
  [26, 179],
  [27, 182],
]) as Theme

export const dark_yellow_alt1_SliderTrackActive = n338 as Theme
const n339 = t([
  [12, 184],
  [13, 183],
  [14, 92],
  [15, 182],
  [16, 185],
  [17, 0],
  [18, 176],
  [19, 177],
  [20, 176],
  [21, 177],
  [22, 175],
  [23, 182],
  [24, 180],
  [25, 92],
  [26, 182],
  [27, 179],
]) as Theme

export const dark_yellow_alt1_SliderThumb = n339 as Theme
export const dark_yellow_alt1_Tooltip = n339 as Theme
export const dark_yellow_alt1_ProgressIndicator = n339 as Theme
const n340 = t([
  [12, 179],
  [13, 180],
  [14, 182],
  [15, 92],
  [16, 178],
  [17, 177],
  [18, 184],
  [19, 183],
  [20, 184],
  [21, 183],
  [22, 184],
  [23, 182],
  [24, 92],
  [25, 180],
  [26, 182],
  [27, 180],
]) as Theme

export const dark_yellow_alt2_Card = n340 as Theme
export const dark_yellow_alt2_DrawerFrame = n340 as Theme
export const dark_yellow_alt2_Progress = n340 as Theme
export const dark_yellow_alt2_TooltipArrow = n340 as Theme
const n341 = t([
  [12, 180],
  [13, 182],
  [14, 92],
  [15, 183],
  [16, 179],
  [17, 178],
  [18, 184],
  [19, 183],
  [20, 184],
  [21, 183],
  [22, 183],
  [23, 182],
  [24, 92],
  [25, 180],
  [26, 182],
  [27, 179],
]) as Theme

export const dark_yellow_alt2_Button = n341 as Theme
export const dark_yellow_alt2_Switch = n341 as Theme
export const dark_yellow_alt2_TooltipContent = n341 as Theme
export const dark_yellow_alt2_SliderTrack = n341 as Theme
const n342 = t([
  [12, 178],
  [13, 179],
  [14, 180],
  [15, 182],
  [16, 177],
  [17, 176],
  [18, 184],
  [19, 183],
  [20, 184],
  [21, 183],
  [22, 185],
  [23, 92],
  [24, 183],
  [25, 182],
  [26, 92],
  [27, 182],
]) as Theme

export const dark_yellow_alt2_Checkbox = n342 as Theme
export const dark_yellow_alt2_RadioGroupItem = n342 as Theme
export const dark_yellow_alt2_Input = n342 as Theme
export const dark_yellow_alt2_TextArea = n342 as Theme
const n343 = t([
  [12, 185],
  [13, 184],
  [14, 183],
  [15, 92],
  [16, 0],
  [17, 0],
  [18, 177],
  [19, 178],
  [20, 177],
  [21, 178],
  [22, 175],
  [23, 183],
  [24, 92],
  [25, 184],
  [26, 183],
  [27, 178],
]) as Theme

export const dark_yellow_alt2_SwitchThumb = n343 as Theme
const n344 = t([
  [12, 182],
  [13, 180],
  [14, 179],
  [15, 178],
  [16, 92],
  [17, 183],
  [18, 177],
  [19, 178],
  [20, 177],
  [21, 178],
  [22, 178],
  [23, 179],
  [24, 178],
  [25, 180],
  [26, 179],
  [27, 92],
]) as Theme

export const dark_yellow_alt2_SliderTrackActive = n344 as Theme
const n345 = t([
  [12, 183],
  [13, 92],
  [14, 182],
  [15, 180],
  [16, 184],
  [17, 185],
  [18, 177],
  [19, 178],
  [20, 177],
  [21, 178],
  [22, 176],
  [23, 182],
  [24, 180],
  [25, 92],
  [26, 182],
  [27, 180],
]) as Theme

export const dark_yellow_alt2_SliderThumb = n345 as Theme
export const dark_yellow_alt2_Tooltip = n345 as Theme
export const dark_yellow_alt2_ProgressIndicator = n345 as Theme
const n346 = t([
  [12, 180],
  [13, 182],
  [14, 92],
  [15, 183],
  [16, 179],
  [17, 178],
  [19, 92],
  [20, 183],
  [21, 92],
  [22, 183],
  [23, 92],
  [24, 183],
  [25, 182],
  [26, 92],
  [27, 179],
]) as Theme

export const dark_yellow_active_Card = n346 as Theme
export const dark_yellow_active_DrawerFrame = n346 as Theme
export const dark_yellow_active_Progress = n346 as Theme
export const dark_yellow_active_TooltipArrow = n346 as Theme
const n347 = t([
  [12, 182],
  [13, 92],
  [14, 183],
  [15, 184],
  [16, 180],
  [17, 179],
  [19, 92],
  [20, 183],
  [21, 92],
  [22, 92],
  [23, 92],
  [24, 183],
  [25, 182],
  [26, 92],
  [27, 178],
]) as Theme

export const dark_yellow_active_Button = n347 as Theme
export const dark_yellow_active_Switch = n347 as Theme
export const dark_yellow_active_TooltipContent = n347 as Theme
export const dark_yellow_active_SliderTrack = n347 as Theme
const n348 = t([
  [12, 179],
  [13, 180],
  [14, 182],
  [15, 92],
  [16, 178],
  [17, 177],
  [19, 92],
  [20, 183],
  [21, 92],
  [22, 184],
  [23, 183],
  [24, 184],
  [25, 92],
  [26, 183],
  [27, 180],
]) as Theme

export const dark_yellow_active_Checkbox = n348 as Theme
export const dark_yellow_active_RadioGroupItem = n348 as Theme
export const dark_yellow_active_Input = n348 as Theme
export const dark_yellow_active_TextArea = n348 as Theme
const n349 = t([
  [12, 184],
  [13, 183],
  [14, 92],
  [15, 182],
  [16, 185],
  [17, 0],
  [19, 179],
  [20, 178],
  [21, 179],
  [22, 175],
  [23, 92],
  [24, 182],
  [25, 183],
  [26, 92],
  [27, 179],
]) as Theme

export const dark_yellow_active_SwitchThumb = n349 as Theme
const n350 = t([
  [12, 180],
  [13, 179],
  [14, 178],
  [15, 177],
  [16, 182],
  [17, 92],
  [19, 179],
  [20, 178],
  [21, 179],
  [22, 179],
  [23, 178],
  [24, 177],
  [25, 179],
  [26, 178],
  [27, 183],
]) as Theme

export const dark_yellow_active_SliderTrackActive = n350 as Theme
const n351 = t([
  [12, 92],
  [13, 182],
  [14, 180],
  [15, 179],
  [16, 183],
  [17, 184],
  [19, 179],
  [20, 178],
  [21, 179],
  [22, 177],
  [23, 180],
  [24, 179],
  [25, 182],
  [26, 180],
  [27, 182],
]) as Theme

export const dark_yellow_active_SliderThumb = n351 as Theme
export const dark_yellow_active_Tooltip = n351 as Theme
export const dark_yellow_active_ProgressIndicator = n351 as Theme
const n352 = t([
  [12, 134],
  [13, 135],
  [14, 136],
  [15, 138],
  [16, 133],
  [17, 132],
  [18, 141],
  [19, 140],
  [20, 141],
  [21, 140],
  [22, 141],
  [23, 138],
  [24, 44],
  [25, 136],
  [26, 138],
  [27, 138],
]) as Theme

export const dark_green_alt1_Card = n352 as Theme
export const dark_green_alt1_DrawerFrame = n352 as Theme
export const dark_green_alt1_Progress = n352 as Theme
export const dark_green_alt1_TooltipArrow = n352 as Theme
const n353 = t([
  [12, 135],
  [13, 136],
  [14, 138],
  [15, 44],
  [16, 134],
  [17, 133],
  [18, 141],
  [19, 140],
  [20, 141],
  [21, 140],
  [22, 140],
  [23, 138],
  [24, 44],
  [25, 136],
  [26, 138],
  [27, 136],
]) as Theme

export const dark_green_alt1_Button = n353 as Theme
export const dark_green_alt1_Switch = n353 as Theme
export const dark_green_alt1_TooltipContent = n353 as Theme
export const dark_green_alt1_SliderTrack = n353 as Theme
const n354 = t([
  [12, 133],
  [13, 134],
  [14, 135],
  [15, 136],
  [16, 132],
  [17, 131],
  [18, 141],
  [19, 140],
  [20, 141],
  [21, 140],
  [22, 0],
  [23, 44],
  [24, 139],
  [25, 138],
  [26, 44],
  [27, 44],
]) as Theme

export const dark_green_alt1_Checkbox = n354 as Theme
export const dark_green_alt1_RadioGroupItem = n354 as Theme
export const dark_green_alt1_Input = n354 as Theme
export const dark_green_alt1_TextArea = n354 as Theme
const n355 = t([
  [12, 0],
  [13, 141],
  [14, 140],
  [15, 139],
  [16, 0],
  [17, 0],
  [18, 132],
  [19, 133],
  [20, 132],
  [21, 133],
  [22, 131],
  [23, 139],
  [24, 44],
  [25, 140],
  [26, 139],
  [27, 133],
]) as Theme

export const dark_green_alt1_SwitchThumb = n355 as Theme
const n356 = t([
  [12, 44],
  [13, 138],
  [14, 136],
  [15, 135],
  [16, 139],
  [17, 140],
  [18, 132],
  [19, 133],
  [20, 132],
  [21, 133],
  [22, 133],
  [23, 135],
  [24, 134],
  [25, 136],
  [26, 135],
  [27, 138],
]) as Theme

export const dark_green_alt1_SliderTrackActive = n356 as Theme
const n357 = t([
  [12, 140],
  [13, 139],
  [14, 44],
  [15, 138],
  [16, 141],
  [17, 0],
  [18, 132],
  [19, 133],
  [20, 132],
  [21, 133],
  [22, 131],
  [23, 138],
  [24, 136],
  [25, 44],
  [26, 138],
  [27, 135],
]) as Theme

export const dark_green_alt1_SliderThumb = n357 as Theme
export const dark_green_alt1_Tooltip = n357 as Theme
export const dark_green_alt1_ProgressIndicator = n357 as Theme
const n358 = t([
  [12, 135],
  [13, 136],
  [14, 138],
  [15, 44],
  [16, 134],
  [17, 133],
  [18, 140],
  [19, 139],
  [20, 140],
  [21, 139],
  [22, 140],
  [23, 138],
  [24, 44],
  [25, 136],
  [26, 138],
  [27, 136],
]) as Theme

export const dark_green_alt2_Card = n358 as Theme
export const dark_green_alt2_DrawerFrame = n358 as Theme
export const dark_green_alt2_Progress = n358 as Theme
export const dark_green_alt2_TooltipArrow = n358 as Theme
const n359 = t([
  [12, 136],
  [13, 138],
  [14, 44],
  [15, 139],
  [16, 135],
  [17, 134],
  [18, 140],
  [19, 139],
  [20, 140],
  [21, 139],
  [22, 139],
  [23, 138],
  [24, 44],
  [25, 136],
  [26, 138],
  [27, 135],
]) as Theme

export const dark_green_alt2_Button = n359 as Theme
export const dark_green_alt2_Switch = n359 as Theme
export const dark_green_alt2_TooltipContent = n359 as Theme
export const dark_green_alt2_SliderTrack = n359 as Theme
const n360 = t([
  [12, 134],
  [13, 135],
  [14, 136],
  [15, 138],
  [16, 133],
  [17, 132],
  [18, 140],
  [19, 139],
  [20, 140],
  [21, 139],
  [22, 141],
  [23, 44],
  [24, 139],
  [25, 138],
  [26, 44],
  [27, 138],
]) as Theme

export const dark_green_alt2_Checkbox = n360 as Theme
export const dark_green_alt2_RadioGroupItem = n360 as Theme
export const dark_green_alt2_Input = n360 as Theme
export const dark_green_alt2_TextArea = n360 as Theme
const n361 = t([
  [12, 141],
  [13, 140],
  [14, 139],
  [15, 44],
  [16, 0],
  [17, 0],
  [18, 133],
  [19, 134],
  [20, 133],
  [21, 134],
  [22, 131],
  [23, 139],
  [24, 44],
  [25, 140],
  [26, 139],
  [27, 134],
]) as Theme

export const dark_green_alt2_SwitchThumb = n361 as Theme
const n362 = t([
  [12, 138],
  [13, 136],
  [14, 135],
  [15, 134],
  [16, 44],
  [17, 139],
  [18, 133],
  [19, 134],
  [20, 133],
  [21, 134],
  [22, 134],
  [23, 135],
  [24, 134],
  [25, 136],
  [26, 135],
  [27, 44],
]) as Theme

export const dark_green_alt2_SliderTrackActive = n362 as Theme
const n363 = t([
  [12, 139],
  [13, 44],
  [14, 138],
  [15, 136],
  [16, 140],
  [17, 141],
  [18, 133],
  [19, 134],
  [20, 133],
  [21, 134],
  [22, 132],
  [23, 138],
  [24, 136],
  [25, 44],
  [26, 138],
  [27, 136],
]) as Theme

export const dark_green_alt2_SliderThumb = n363 as Theme
export const dark_green_alt2_Tooltip = n363 as Theme
export const dark_green_alt2_ProgressIndicator = n363 as Theme
const n364 = t([
  [12, 136],
  [13, 138],
  [14, 44],
  [15, 139],
  [16, 135],
  [17, 134],
  [19, 44],
  [20, 139],
  [21, 44],
  [22, 139],
  [23, 44],
  [24, 139],
  [25, 138],
  [26, 44],
  [27, 135],
]) as Theme

export const dark_green_active_Card = n364 as Theme
export const dark_green_active_DrawerFrame = n364 as Theme
export const dark_green_active_Progress = n364 as Theme
export const dark_green_active_TooltipArrow = n364 as Theme
const n365 = t([
  [12, 138],
  [13, 44],
  [14, 139],
  [15, 140],
  [16, 136],
  [17, 135],
  [19, 44],
  [20, 139],
  [21, 44],
  [22, 44],
  [23, 44],
  [24, 139],
  [25, 138],
  [26, 44],
  [27, 134],
]) as Theme

export const dark_green_active_Button = n365 as Theme
export const dark_green_active_Switch = n365 as Theme
export const dark_green_active_TooltipContent = n365 as Theme
export const dark_green_active_SliderTrack = n365 as Theme
const n366 = t([
  [12, 135],
  [13, 136],
  [14, 138],
  [15, 44],
  [16, 134],
  [17, 133],
  [19, 44],
  [20, 139],
  [21, 44],
  [22, 140],
  [23, 139],
  [24, 140],
  [25, 44],
  [26, 139],
  [27, 136],
]) as Theme

export const dark_green_active_Checkbox = n366 as Theme
export const dark_green_active_RadioGroupItem = n366 as Theme
export const dark_green_active_Input = n366 as Theme
export const dark_green_active_TextArea = n366 as Theme
const n367 = t([
  [12, 140],
  [13, 139],
  [14, 44],
  [15, 138],
  [16, 141],
  [17, 0],
  [19, 135],
  [20, 134],
  [21, 135],
  [22, 131],
  [23, 44],
  [24, 138],
  [25, 139],
  [26, 44],
  [27, 135],
]) as Theme

export const dark_green_active_SwitchThumb = n367 as Theme
const n368 = t([
  [12, 136],
  [13, 135],
  [14, 134],
  [15, 133],
  [16, 138],
  [17, 44],
  [19, 135],
  [20, 134],
  [21, 135],
  [22, 135],
  [23, 134],
  [24, 133],
  [25, 135],
  [26, 134],
  [27, 139],
]) as Theme

export const dark_green_active_SliderTrackActive = n368 as Theme
const n369 = t([
  [12, 44],
  [13, 138],
  [14, 136],
  [15, 135],
  [16, 139],
  [17, 140],
  [19, 135],
  [20, 134],
  [21, 135],
  [22, 133],
  [23, 136],
  [24, 135],
  [25, 138],
  [26, 136],
  [27, 138],
]) as Theme

export const dark_green_active_SliderThumb = n369 as Theme
export const dark_green_active_Tooltip = n369 as Theme
export const dark_green_active_ProgressIndicator = n369 as Theme
const n370 = t([
  [12, 112],
  [13, 113],
  [14, 114],
  [15, 116],
  [16, 111],
  [17, 110],
  [18, 119],
  [19, 118],
  [20, 119],
  [21, 118],
  [22, 119],
  [23, 116],
  [24, 22],
  [25, 114],
  [26, 116],
  [27, 116],
]) as Theme

export const dark_blue_alt1_Card = n370 as Theme
export const dark_blue_alt1_DrawerFrame = n370 as Theme
export const dark_blue_alt1_Progress = n370 as Theme
export const dark_blue_alt1_TooltipArrow = n370 as Theme
const n371 = t([
  [12, 113],
  [13, 114],
  [14, 116],
  [15, 22],
  [16, 112],
  [17, 111],
  [18, 119],
  [19, 118],
  [20, 119],
  [21, 118],
  [22, 118],
  [23, 116],
  [24, 22],
  [25, 114],
  [26, 116],
  [27, 114],
]) as Theme

export const dark_blue_alt1_Button = n371 as Theme
export const dark_blue_alt1_Switch = n371 as Theme
export const dark_blue_alt1_TooltipContent = n371 as Theme
export const dark_blue_alt1_SliderTrack = n371 as Theme
const n372 = t([
  [12, 111],
  [13, 112],
  [14, 113],
  [15, 114],
  [16, 110],
  [17, 109],
  [18, 119],
  [19, 118],
  [20, 119],
  [21, 118],
  [22, 0],
  [23, 22],
  [24, 117],
  [25, 116],
  [26, 22],
  [27, 22],
]) as Theme

export const dark_blue_alt1_Checkbox = n372 as Theme
export const dark_blue_alt1_RadioGroupItem = n372 as Theme
export const dark_blue_alt1_Input = n372 as Theme
export const dark_blue_alt1_TextArea = n372 as Theme
const n373 = t([
  [12, 0],
  [13, 119],
  [14, 118],
  [15, 117],
  [16, 0],
  [17, 0],
  [18, 110],
  [19, 111],
  [20, 110],
  [21, 111],
  [22, 109],
  [23, 117],
  [24, 22],
  [25, 118],
  [26, 117],
  [27, 111],
]) as Theme

export const dark_blue_alt1_SwitchThumb = n373 as Theme
const n374 = t([
  [12, 22],
  [13, 116],
  [14, 114],
  [15, 113],
  [16, 117],
  [17, 118],
  [18, 110],
  [19, 111],
  [20, 110],
  [21, 111],
  [22, 111],
  [23, 113],
  [24, 112],
  [25, 114],
  [26, 113],
  [27, 116],
]) as Theme

export const dark_blue_alt1_SliderTrackActive = n374 as Theme
const n375 = t([
  [12, 118],
  [13, 117],
  [14, 22],
  [15, 116],
  [16, 119],
  [17, 0],
  [18, 110],
  [19, 111],
  [20, 110],
  [21, 111],
  [22, 109],
  [23, 116],
  [24, 114],
  [25, 22],
  [26, 116],
  [27, 113],
]) as Theme

export const dark_blue_alt1_SliderThumb = n375 as Theme
export const dark_blue_alt1_Tooltip = n375 as Theme
export const dark_blue_alt1_ProgressIndicator = n375 as Theme
const n376 = t([
  [12, 113],
  [13, 114],
  [14, 116],
  [15, 22],
  [16, 112],
  [17, 111],
  [18, 118],
  [19, 117],
  [20, 118],
  [21, 117],
  [22, 118],
  [23, 116],
  [24, 22],
  [25, 114],
  [26, 116],
  [27, 114],
]) as Theme

export const dark_blue_alt2_Card = n376 as Theme
export const dark_blue_alt2_DrawerFrame = n376 as Theme
export const dark_blue_alt2_Progress = n376 as Theme
export const dark_blue_alt2_TooltipArrow = n376 as Theme
const n377 = t([
  [12, 114],
  [13, 116],
  [14, 22],
  [15, 117],
  [16, 113],
  [17, 112],
  [18, 118],
  [19, 117],
  [20, 118],
  [21, 117],
  [22, 117],
  [23, 116],
  [24, 22],
  [25, 114],
  [26, 116],
  [27, 113],
]) as Theme

export const dark_blue_alt2_Button = n377 as Theme
export const dark_blue_alt2_Switch = n377 as Theme
export const dark_blue_alt2_TooltipContent = n377 as Theme
export const dark_blue_alt2_SliderTrack = n377 as Theme
const n378 = t([
  [12, 112],
  [13, 113],
  [14, 114],
  [15, 116],
  [16, 111],
  [17, 110],
  [18, 118],
  [19, 117],
  [20, 118],
  [21, 117],
  [22, 119],
  [23, 22],
  [24, 117],
  [25, 116],
  [26, 22],
  [27, 116],
]) as Theme

export const dark_blue_alt2_Checkbox = n378 as Theme
export const dark_blue_alt2_RadioGroupItem = n378 as Theme
export const dark_blue_alt2_Input = n378 as Theme
export const dark_blue_alt2_TextArea = n378 as Theme
const n379 = t([
  [12, 119],
  [13, 118],
  [14, 117],
  [15, 22],
  [16, 0],
  [17, 0],
  [18, 111],
  [19, 112],
  [20, 111],
  [21, 112],
  [22, 109],
  [23, 117],
  [24, 22],
  [25, 118],
  [26, 117],
  [27, 112],
]) as Theme

export const dark_blue_alt2_SwitchThumb = n379 as Theme
const n380 = t([
  [12, 116],
  [13, 114],
  [14, 113],
  [15, 112],
  [16, 22],
  [17, 117],
  [18, 111],
  [19, 112],
  [20, 111],
  [21, 112],
  [22, 112],
  [23, 113],
  [24, 112],
  [25, 114],
  [26, 113],
  [27, 22],
]) as Theme

export const dark_blue_alt2_SliderTrackActive = n380 as Theme
const n381 = t([
  [12, 117],
  [13, 22],
  [14, 116],
  [15, 114],
  [16, 118],
  [17, 119],
  [18, 111],
  [19, 112],
  [20, 111],
  [21, 112],
  [22, 110],
  [23, 116],
  [24, 114],
  [25, 22],
  [26, 116],
  [27, 114],
]) as Theme

export const dark_blue_alt2_SliderThumb = n381 as Theme
export const dark_blue_alt2_Tooltip = n381 as Theme
export const dark_blue_alt2_ProgressIndicator = n381 as Theme
const n382 = t([
  [12, 114],
  [13, 116],
  [14, 22],
  [15, 117],
  [16, 113],
  [17, 112],
  [19, 22],
  [20, 117],
  [21, 22],
  [22, 117],
  [23, 22],
  [24, 117],
  [25, 116],
  [26, 22],
  [27, 113],
]) as Theme

export const dark_blue_active_Card = n382 as Theme
export const dark_blue_active_DrawerFrame = n382 as Theme
export const dark_blue_active_Progress = n382 as Theme
export const dark_blue_active_TooltipArrow = n382 as Theme
const n383 = t([
  [12, 116],
  [13, 22],
  [14, 117],
  [15, 118],
  [16, 114],
  [17, 113],
  [19, 22],
  [20, 117],
  [21, 22],
  [22, 22],
  [23, 22],
  [24, 117],
  [25, 116],
  [26, 22],
  [27, 112],
]) as Theme

export const dark_blue_active_Button = n383 as Theme
export const dark_blue_active_Switch = n383 as Theme
export const dark_blue_active_TooltipContent = n383 as Theme
export const dark_blue_active_SliderTrack = n383 as Theme
const n384 = t([
  [12, 113],
  [13, 114],
  [14, 116],
  [15, 22],
  [16, 112],
  [17, 111],
  [19, 22],
  [20, 117],
  [21, 22],
  [22, 118],
  [23, 117],
  [24, 118],
  [25, 22],
  [26, 117],
  [27, 114],
]) as Theme

export const dark_blue_active_Checkbox = n384 as Theme
export const dark_blue_active_RadioGroupItem = n384 as Theme
export const dark_blue_active_Input = n384 as Theme
export const dark_blue_active_TextArea = n384 as Theme
const n385 = t([
  [12, 118],
  [13, 117],
  [14, 22],
  [15, 116],
  [16, 119],
  [17, 0],
  [19, 113],
  [20, 112],
  [21, 113],
  [22, 109],
  [23, 22],
  [24, 116],
  [25, 117],
  [26, 22],
  [27, 113],
]) as Theme

export const dark_blue_active_SwitchThumb = n385 as Theme
const n386 = t([
  [12, 114],
  [13, 113],
  [14, 112],
  [15, 111],
  [16, 116],
  [17, 22],
  [19, 113],
  [20, 112],
  [21, 113],
  [22, 113],
  [23, 112],
  [24, 111],
  [25, 113],
  [26, 112],
  [27, 117],
]) as Theme

export const dark_blue_active_SliderTrackActive = n386 as Theme
const n387 = t([
  [12, 22],
  [13, 116],
  [14, 114],
  [15, 113],
  [16, 117],
  [17, 118],
  [19, 113],
  [20, 112],
  [21, 113],
  [22, 111],
  [23, 114],
  [24, 113],
  [25, 116],
  [26, 114],
  [27, 116],
]) as Theme

export const dark_blue_active_SliderThumb = n387 as Theme
export const dark_blue_active_Tooltip = n387 as Theme
export const dark_blue_active_ProgressIndicator = n387 as Theme
const n388 = t([
  [12, 156],
  [13, 157],
  [14, 158],
  [15, 160],
  [16, 155],
  [17, 154],
  [18, 163],
  [19, 162],
  [20, 163],
  [21, 162],
  [22, 163],
  [23, 160],
  [24, 68],
  [25, 158],
  [26, 160],
  [27, 160],
]) as Theme

export const dark_mint_alt1_Card = n388 as Theme
export const dark_mint_alt1_DrawerFrame = n388 as Theme
export const dark_mint_alt1_Progress = n388 as Theme
export const dark_mint_alt1_TooltipArrow = n388 as Theme
const n389 = t([
  [12, 157],
  [13, 158],
  [14, 160],
  [15, 68],
  [16, 156],
  [17, 155],
  [18, 163],
  [19, 162],
  [20, 163],
  [21, 162],
  [22, 162],
  [23, 160],
  [24, 68],
  [25, 158],
  [26, 160],
  [27, 158],
]) as Theme

export const dark_mint_alt1_Button = n389 as Theme
export const dark_mint_alt1_Switch = n389 as Theme
export const dark_mint_alt1_TooltipContent = n389 as Theme
export const dark_mint_alt1_SliderTrack = n389 as Theme
const n390 = t([
  [12, 155],
  [13, 156],
  [14, 157],
  [15, 158],
  [16, 154],
  [17, 153],
  [18, 163],
  [19, 162],
  [20, 163],
  [21, 162],
  [22, 0],
  [23, 68],
  [24, 161],
  [25, 160],
  [26, 68],
  [27, 68],
]) as Theme

export const dark_mint_alt1_Checkbox = n390 as Theme
export const dark_mint_alt1_RadioGroupItem = n390 as Theme
export const dark_mint_alt1_Input = n390 as Theme
export const dark_mint_alt1_TextArea = n390 as Theme
const n391 = t([
  [12, 0],
  [13, 163],
  [14, 162],
  [15, 161],
  [16, 0],
  [17, 0],
  [18, 154],
  [19, 155],
  [20, 154],
  [21, 155],
  [22, 153],
  [23, 161],
  [24, 68],
  [25, 162],
  [26, 161],
  [27, 155],
]) as Theme

export const dark_mint_alt1_SwitchThumb = n391 as Theme
const n392 = t([
  [12, 68],
  [13, 160],
  [14, 158],
  [15, 157],
  [16, 161],
  [17, 162],
  [18, 154],
  [19, 155],
  [20, 154],
  [21, 155],
  [22, 155],
  [23, 157],
  [24, 156],
  [25, 158],
  [26, 157],
  [27, 160],
]) as Theme

export const dark_mint_alt1_SliderTrackActive = n392 as Theme
const n393 = t([
  [12, 162],
  [13, 161],
  [14, 68],
  [15, 160],
  [16, 163],
  [17, 0],
  [18, 154],
  [19, 155],
  [20, 154],
  [21, 155],
  [22, 153],
  [23, 160],
  [24, 158],
  [25, 68],
  [26, 160],
  [27, 157],
]) as Theme

export const dark_mint_alt1_SliderThumb = n393 as Theme
export const dark_mint_alt1_Tooltip = n393 as Theme
export const dark_mint_alt1_ProgressIndicator = n393 as Theme
const n394 = t([
  [12, 157],
  [13, 158],
  [14, 160],
  [15, 68],
  [16, 156],
  [17, 155],
  [18, 162],
  [19, 161],
  [20, 162],
  [21, 161],
  [22, 162],
  [23, 160],
  [24, 68],
  [25, 158],
  [26, 160],
  [27, 158],
]) as Theme

export const dark_mint_alt2_Card = n394 as Theme
export const dark_mint_alt2_DrawerFrame = n394 as Theme
export const dark_mint_alt2_Progress = n394 as Theme
export const dark_mint_alt2_TooltipArrow = n394 as Theme
const n395 = t([
  [12, 158],
  [13, 160],
  [14, 68],
  [15, 161],
  [16, 157],
  [17, 156],
  [18, 162],
  [19, 161],
  [20, 162],
  [21, 161],
  [22, 161],
  [23, 160],
  [24, 68],
  [25, 158],
  [26, 160],
  [27, 157],
]) as Theme

export const dark_mint_alt2_Button = n395 as Theme
export const dark_mint_alt2_Switch = n395 as Theme
export const dark_mint_alt2_TooltipContent = n395 as Theme
export const dark_mint_alt2_SliderTrack = n395 as Theme
const n396 = t([
  [12, 156],
  [13, 157],
  [14, 158],
  [15, 160],
  [16, 155],
  [17, 154],
  [18, 162],
  [19, 161],
  [20, 162],
  [21, 161],
  [22, 163],
  [23, 68],
  [24, 161],
  [25, 160],
  [26, 68],
  [27, 160],
]) as Theme

export const dark_mint_alt2_Checkbox = n396 as Theme
export const dark_mint_alt2_RadioGroupItem = n396 as Theme
export const dark_mint_alt2_Input = n396 as Theme
export const dark_mint_alt2_TextArea = n396 as Theme
const n397 = t([
  [12, 163],
  [13, 162],
  [14, 161],
  [15, 68],
  [16, 0],
  [17, 0],
  [18, 155],
  [19, 156],
  [20, 155],
  [21, 156],
  [22, 153],
  [23, 161],
  [24, 68],
  [25, 162],
  [26, 161],
  [27, 156],
]) as Theme

export const dark_mint_alt2_SwitchThumb = n397 as Theme
const n398 = t([
  [12, 160],
  [13, 158],
  [14, 157],
  [15, 156],
  [16, 68],
  [17, 161],
  [18, 155],
  [19, 156],
  [20, 155],
  [21, 156],
  [22, 156],
  [23, 157],
  [24, 156],
  [25, 158],
  [26, 157],
  [27, 68],
]) as Theme

export const dark_mint_alt2_SliderTrackActive = n398 as Theme
const n399 = t([
  [12, 161],
  [13, 68],
  [14, 160],
  [15, 158],
  [16, 162],
  [17, 163],
  [18, 155],
  [19, 156],
  [20, 155],
  [21, 156],
  [22, 154],
  [23, 160],
  [24, 158],
  [25, 68],
  [26, 160],
  [27, 158],
]) as Theme

export const dark_mint_alt2_SliderThumb = n399 as Theme
export const dark_mint_alt2_Tooltip = n399 as Theme
export const dark_mint_alt2_ProgressIndicator = n399 as Theme
const n400 = t([
  [12, 158],
  [13, 160],
  [14, 68],
  [15, 161],
  [16, 157],
  [17, 156],
  [19, 68],
  [20, 161],
  [21, 68],
  [22, 161],
  [23, 68],
  [24, 161],
  [25, 160],
  [26, 68],
  [27, 157],
]) as Theme

export const dark_mint_active_Card = n400 as Theme
export const dark_mint_active_DrawerFrame = n400 as Theme
export const dark_mint_active_Progress = n400 as Theme
export const dark_mint_active_TooltipArrow = n400 as Theme
const n401 = t([
  [12, 160],
  [13, 68],
  [14, 161],
  [15, 162],
  [16, 158],
  [17, 157],
  [19, 68],
  [20, 161],
  [21, 68],
  [22, 68],
  [23, 68],
  [24, 161],
  [25, 160],
  [26, 68],
  [27, 156],
]) as Theme

export const dark_mint_active_Button = n401 as Theme
export const dark_mint_active_Switch = n401 as Theme
export const dark_mint_active_TooltipContent = n401 as Theme
export const dark_mint_active_SliderTrack = n401 as Theme
const n402 = t([
  [12, 157],
  [13, 158],
  [14, 160],
  [15, 68],
  [16, 156],
  [17, 155],
  [19, 68],
  [20, 161],
  [21, 68],
  [22, 162],
  [23, 161],
  [24, 162],
  [25, 68],
  [26, 161],
  [27, 158],
]) as Theme

export const dark_mint_active_Checkbox = n402 as Theme
export const dark_mint_active_RadioGroupItem = n402 as Theme
export const dark_mint_active_Input = n402 as Theme
export const dark_mint_active_TextArea = n402 as Theme
const n403 = t([
  [12, 162],
  [13, 161],
  [14, 68],
  [15, 160],
  [16, 163],
  [17, 0],
  [19, 157],
  [20, 156],
  [21, 157],
  [22, 153],
  [23, 68],
  [24, 160],
  [25, 161],
  [26, 68],
  [27, 157],
]) as Theme

export const dark_mint_active_SwitchThumb = n403 as Theme
const n404 = t([
  [12, 158],
  [13, 157],
  [14, 156],
  [15, 155],
  [16, 160],
  [17, 68],
  [19, 157],
  [20, 156],
  [21, 157],
  [22, 157],
  [23, 156],
  [24, 155],
  [25, 157],
  [26, 156],
  [27, 161],
]) as Theme

export const dark_mint_active_SliderTrackActive = n404 as Theme
const n405 = t([
  [12, 68],
  [13, 160],
  [14, 158],
  [15, 157],
  [16, 161],
  [17, 162],
  [19, 157],
  [20, 156],
  [21, 157],
  [22, 155],
  [23, 158],
  [24, 157],
  [25, 160],
  [26, 158],
  [27, 160],
]) as Theme

export const dark_mint_active_SliderThumb = n405 as Theme
export const dark_mint_active_Tooltip = n405 as Theme
export const dark_mint_active_ProgressIndicator = n405 as Theme
const n406 = t([
  [12, 167],
  [13, 168],
  [14, 169],
  [15, 171],
  [16, 166],
  [17, 165],
  [18, 174],
  [19, 173],
  [20, 174],
  [21, 173],
  [22, 174],
  [23, 171],
  [24, 80],
  [25, 169],
  [26, 171],
  [27, 171],
]) as Theme

export const dark_red_alt1_Card = n406 as Theme
export const dark_red_alt1_DrawerFrame = n406 as Theme
export const dark_red_alt1_Progress = n406 as Theme
export const dark_red_alt1_TooltipArrow = n406 as Theme
const n407 = t([
  [12, 168],
  [13, 169],
  [14, 171],
  [15, 80],
  [16, 167],
  [17, 166],
  [18, 174],
  [19, 173],
  [20, 174],
  [21, 173],
  [22, 173],
  [23, 171],
  [24, 80],
  [25, 169],
  [26, 171],
  [27, 169],
]) as Theme

export const dark_red_alt1_Button = n407 as Theme
export const dark_red_alt1_Switch = n407 as Theme
export const dark_red_alt1_TooltipContent = n407 as Theme
export const dark_red_alt1_SliderTrack = n407 as Theme
const n408 = t([
  [12, 166],
  [13, 167],
  [14, 168],
  [15, 169],
  [16, 165],
  [17, 164],
  [18, 174],
  [19, 173],
  [20, 174],
  [21, 173],
  [22, 0],
  [23, 80],
  [24, 172],
  [25, 171],
  [26, 80],
  [27, 80],
]) as Theme

export const dark_red_alt1_Checkbox = n408 as Theme
export const dark_red_alt1_RadioGroupItem = n408 as Theme
export const dark_red_alt1_Input = n408 as Theme
export const dark_red_alt1_TextArea = n408 as Theme
const n409 = t([
  [12, 0],
  [13, 174],
  [14, 173],
  [15, 172],
  [16, 0],
  [17, 0],
  [18, 165],
  [19, 166],
  [20, 165],
  [21, 166],
  [22, 164],
  [23, 172],
  [24, 80],
  [25, 173],
  [26, 172],
  [27, 166],
]) as Theme

export const dark_red_alt1_SwitchThumb = n409 as Theme
const n410 = t([
  [12, 80],
  [13, 171],
  [14, 169],
  [15, 168],
  [16, 172],
  [17, 173],
  [18, 165],
  [19, 166],
  [20, 165],
  [21, 166],
  [22, 166],
  [23, 168],
  [24, 167],
  [25, 169],
  [26, 168],
  [27, 171],
]) as Theme

export const dark_red_alt1_SliderTrackActive = n410 as Theme
const n411 = t([
  [12, 173],
  [13, 172],
  [14, 80],
  [15, 171],
  [16, 174],
  [17, 0],
  [18, 165],
  [19, 166],
  [20, 165],
  [21, 166],
  [22, 164],
  [23, 171],
  [24, 169],
  [25, 80],
  [26, 171],
  [27, 168],
]) as Theme

export const dark_red_alt1_SliderThumb = n411 as Theme
export const dark_red_alt1_Tooltip = n411 as Theme
export const dark_red_alt1_ProgressIndicator = n411 as Theme
const n412 = t([
  [12, 168],
  [13, 169],
  [14, 171],
  [15, 80],
  [16, 167],
  [17, 166],
  [18, 173],
  [19, 172],
  [20, 173],
  [21, 172],
  [22, 173],
  [23, 171],
  [24, 80],
  [25, 169],
  [26, 171],
  [27, 169],
]) as Theme

export const dark_red_alt2_Card = n412 as Theme
export const dark_red_alt2_DrawerFrame = n412 as Theme
export const dark_red_alt2_Progress = n412 as Theme
export const dark_red_alt2_TooltipArrow = n412 as Theme
const n413 = t([
  [12, 169],
  [13, 171],
  [14, 80],
  [15, 172],
  [16, 168],
  [17, 167],
  [18, 173],
  [19, 172],
  [20, 173],
  [21, 172],
  [22, 172],
  [23, 171],
  [24, 80],
  [25, 169],
  [26, 171],
  [27, 168],
]) as Theme

export const dark_red_alt2_Button = n413 as Theme
export const dark_red_alt2_Switch = n413 as Theme
export const dark_red_alt2_TooltipContent = n413 as Theme
export const dark_red_alt2_SliderTrack = n413 as Theme
const n414 = t([
  [12, 167],
  [13, 168],
  [14, 169],
  [15, 171],
  [16, 166],
  [17, 165],
  [18, 173],
  [19, 172],
  [20, 173],
  [21, 172],
  [22, 174],
  [23, 80],
  [24, 172],
  [25, 171],
  [26, 80],
  [27, 171],
]) as Theme

export const dark_red_alt2_Checkbox = n414 as Theme
export const dark_red_alt2_RadioGroupItem = n414 as Theme
export const dark_red_alt2_Input = n414 as Theme
export const dark_red_alt2_TextArea = n414 as Theme
const n415 = t([
  [12, 174],
  [13, 173],
  [14, 172],
  [15, 80],
  [16, 0],
  [17, 0],
  [18, 166],
  [19, 167],
  [20, 166],
  [21, 167],
  [22, 164],
  [23, 172],
  [24, 80],
  [25, 173],
  [26, 172],
  [27, 167],
]) as Theme

export const dark_red_alt2_SwitchThumb = n415 as Theme
const n416 = t([
  [12, 171],
  [13, 169],
  [14, 168],
  [15, 167],
  [16, 80],
  [17, 172],
  [18, 166],
  [19, 167],
  [20, 166],
  [21, 167],
  [22, 167],
  [23, 168],
  [24, 167],
  [25, 169],
  [26, 168],
  [27, 80],
]) as Theme

export const dark_red_alt2_SliderTrackActive = n416 as Theme
const n417 = t([
  [12, 172],
  [13, 80],
  [14, 171],
  [15, 169],
  [16, 173],
  [17, 174],
  [18, 166],
  [19, 167],
  [20, 166],
  [21, 167],
  [22, 165],
  [23, 171],
  [24, 169],
  [25, 80],
  [26, 171],
  [27, 169],
]) as Theme

export const dark_red_alt2_SliderThumb = n417 as Theme
export const dark_red_alt2_Tooltip = n417 as Theme
export const dark_red_alt2_ProgressIndicator = n417 as Theme
const n418 = t([
  [12, 169],
  [13, 171],
  [14, 80],
  [15, 172],
  [16, 168],
  [17, 167],
  [19, 80],
  [20, 172],
  [21, 80],
  [22, 172],
  [23, 80],
  [24, 172],
  [25, 171],
  [26, 80],
  [27, 168],
]) as Theme

export const dark_red_active_Card = n418 as Theme
export const dark_red_active_DrawerFrame = n418 as Theme
export const dark_red_active_Progress = n418 as Theme
export const dark_red_active_TooltipArrow = n418 as Theme
const n419 = t([
  [12, 171],
  [13, 80],
  [14, 172],
  [15, 173],
  [16, 169],
  [17, 168],
  [19, 80],
  [20, 172],
  [21, 80],
  [22, 80],
  [23, 80],
  [24, 172],
  [25, 171],
  [26, 80],
  [27, 167],
]) as Theme

export const dark_red_active_Button = n419 as Theme
export const dark_red_active_Switch = n419 as Theme
export const dark_red_active_TooltipContent = n419 as Theme
export const dark_red_active_SliderTrack = n419 as Theme
const n420 = t([
  [12, 168],
  [13, 169],
  [14, 171],
  [15, 80],
  [16, 167],
  [17, 166],
  [19, 80],
  [20, 172],
  [21, 80],
  [22, 173],
  [23, 172],
  [24, 173],
  [25, 80],
  [26, 172],
  [27, 169],
]) as Theme

export const dark_red_active_Checkbox = n420 as Theme
export const dark_red_active_RadioGroupItem = n420 as Theme
export const dark_red_active_Input = n420 as Theme
export const dark_red_active_TextArea = n420 as Theme
const n421 = t([
  [12, 173],
  [13, 172],
  [14, 80],
  [15, 171],
  [16, 174],
  [17, 0],
  [19, 168],
  [20, 167],
  [21, 168],
  [22, 164],
  [23, 80],
  [24, 171],
  [25, 172],
  [26, 80],
  [27, 168],
]) as Theme

export const dark_red_active_SwitchThumb = n421 as Theme
const n422 = t([
  [12, 169],
  [13, 168],
  [14, 167],
  [15, 166],
  [16, 171],
  [17, 80],
  [19, 168],
  [20, 167],
  [21, 168],
  [22, 168],
  [23, 167],
  [24, 166],
  [25, 168],
  [26, 167],
  [27, 172],
]) as Theme

export const dark_red_active_SliderTrackActive = n422 as Theme
const n423 = t([
  [12, 80],
  [13, 171],
  [14, 169],
  [15, 168],
  [16, 172],
  [17, 173],
  [19, 168],
  [20, 167],
  [21, 168],
  [22, 166],
  [23, 169],
  [24, 168],
  [25, 171],
  [26, 169],
  [27, 171],
]) as Theme

export const dark_red_active_SliderThumb = n423 as Theme
export const dark_red_active_Tooltip = n423 as Theme
export const dark_red_active_ProgressIndicator = n423 as Theme

export const textSizes = {
  $1: {
    fontSize: 8,
    lineHeight: 12,
  },
  $2: {
    fontSize: 12,
    lineHeight: 16,
  },
  $3: {
    fontSize: 14,
    lineHeight: 20,
  },
}
