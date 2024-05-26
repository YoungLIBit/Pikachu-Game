
/**
 *
 * @param n
 * @returns {*[1,2,3,4,...,n]}
 */
function range(n) {
    // Trả về một mảng chứa các giá trị từ 0 đến n
    return [...Array(n + 1).keys()];
}

/**
 *
 * @param a
 * @param b
 * @returns random value between (a,b)
 */
function getRandom(a, b) {
    // Trả về một giá trị ngẫu nhiên giữa a và b
    return Math.floor(Math.random() * (b - a)) + a;
}

/**
 * @description Chuyển vị trí của phần tử trong mảng một chiều thành vị trí trong mảng hai chiều
 * @example arr1[15] -> arr2[2][1] (mảng 2 chiều có 7 hàng và 14 cột)
 * @param n
 * @param col
 * @returns {number: chỉ số hàng của bảng}
 */
function getRow(n, col) {
    // Trả về chỉ số hàng của phần tử trong bảng hai chiều
    return Math.ceil(n / col);
}
//Khởi taạo cột
function getCol(n, col) {
    // Trả về chỉ số cột của phần tử trong bảng hai chiều
    return n % col === 0 ? col : n % col;
}

/**
 * Generate unique random items function
 * @param row
 * @param col
 * @param amount
 * @returns {*[][]}
 */
export function getBoard(row, col, amount) {
    // Tạo danh sách các giá trị làm chỉ số của các phần tử
    const list = range(row * col);
    let remain = row * col;// Số phần tử còn lại
    // Tạo bảng hai chiều với các giá trị khởi tạo là 0
    const table = [...Array(row + 2)].fill(0).map((_)=> [...Array(col + 2)].fill(0));
    let pos, pair_pos, index;

    while(remain > 0) {
        // Xác định số lượng pokemon cần tạo trong lần lặp này
        const pokemon = (remain / 2) > amount ? amount : remain / 2;
        remain -= pokemon * 2;// Giảm số phần tử còn lại

        for (let i = 1; i <= pokemon; i++) {
            // Chọn vị trí đầu tiên
            index = getRandom(1, list.length - 1);
            pos = list[index];
            list[index] = list.pop();

            // Chọn vị trí cặp đôi
            index = getRandom(1, list.length - 1);
            pair_pos = list[index];
            list[index] = list.pop();
            // Gán giá trị cho bảng tại vị trí đã chọn
            table[getRow(pos, col)][getCol(pos, col)] = table[getRow(pair_pos, col)][getCol(pair_pos, col)] = i;
        }
    }

    return table;
}

/**
 * @description Tạo bảng ngẫu nhiên từ bảng nguồn
 * @param {[][]: 2-dim array is source array} source
 */
export function reloadBoard(sourceArr, row, col, amount) {
    const tmpIndex = [];    // Chứa chỉ số của các phần tử có giá trị
    const tmpItems = [];    // Chứa giá trị của các phần tử trên
    let index;

    for(let i = 1; i <= row; i++) {
        for(let j = 1; j <= col; j++ ) {
            if(sourceArr[i][j] !== 0) {
                tmpIndex.push({i, j});
                tmpItems.push(sourceArr[i][j]);
            }
        }
    }
    // Tạo bảng mới từ bảng nguồn và gán các giá trị là 0;
    const table = sourceArr.slice().map(value => value.fill(0));

    for(let k = 0; k < tmpIndex.length; k++) {
        index = getRandom(0, tmpItems.length - 1);

        // Sắp xếp lại
        table[tmpIndex[k].i][tmpIndex[k].j] = tmpItems[index];
        tmpItems[index] = tmpItems.pop();
    }

    return table;
}


