/* eslint-disable react/no-did-update-set-state */
import React from 'react';
import Board from './Board';
import { getBoard, reloadBoard} from '../functions/Generator';
import {getListPosItem} from '../functions/Binder';
import Timer from './Timer';
import { moveTop2Down, moveDown2Top, moveRight2Left, moveLeft2Right, move3CenterLeftRight, move3CenterTopDown, move3OutLeftRight, move3OutTopDown } from './Level';
// import { ProgressBar } from 'react-bootstrap';
import ScoreBoard from "./ScoreBoard";
import Fireworks from 'fireworks-react';

let i, j, k;  // iterator

class Game extends React.Component {

    /**
     * @description cập nhật bảng khi sự kiện tải lại được kích hoạt
     */
    reloadHandler = () => {
        if(this.state.reload <= 0) {
            if(window.confirm('You lost! Restart game?')) {this.renew();}
        }else{
            const oldItems = this.state.items.slice();
            const _newItems = reloadBoard(oldItems, this.row, this.col, this.amount);

            this.setState({
                items: _newItems,
                reload: this.state.reload - 1,
            });

            this.listPosItem = getListPosItem(_newItems, this.row, this.col, this.amount);

            this.setState({
                isJustReloaded: true,
            });
        }
    };
    /**
     * @description: tạo bảng mới và thực hiện một số hành động khi lên cấp
     */
    doNextLevel = () => {
        const _newItems = getBoard(this.row, this.col, this.amount);

        this.setState({
            items: _newItems,
            reload: this.state.reload + 1,
            time: this.time,
            isNew: true,
            level: this.state.level + 1,
        });

        this.listPosItem = getListPosItem(_newItems, this.row, this.col, this.amount);
    };
    onTimeout = () =>{
        if(window.confirm('You lost cuz timeout! Restart game?')) {this.renew();}
    };

    /**
     * @description  kiểm tra nếu hai điểm trên cùng một hàng hoặc cột
     * @param abscissa của mục đầu tiên
     * @param abscissa của mục tiếp theo
     * @param ordinate của hai mục
     * @returns {boolean}
     */
    checkLineX = (y1, y2, x) => {
        const yleft = Math.min(y1, y2);
        const yright = Math.max(y1, y2);
        const tmp = [];

        for( let yi = yleft + 1; yi < yright; yi++) {
            if(this.state.items[x][yi] !== 0) {
                return false;
            }

            tmp.push({x: x, y: yi, value: 'horizontal'});
        }

        this.lines.push(...tmp);
        return true;
    };
    checkLineY = (x1, x2, y) => {
        const xup = Math.min(x1, x2);
        const xdown = Math.max(x1, x2);
        const tmp = [];

        for( let xi = xup + 1; xi < xdown; xi++) {
            if(this.state.items[xi][y] !== 0) {
                return false;
            }
            tmp.push({x: xi, y: y, value: 'vertical'});
        }

        this.lines.push(...tmp);
        return true;
    };

    /**
     * @description kiểm tra nếu hai điểm nằm trong hình chữ nhật
     * @param p1:  điểm thứ nhất
     * @param p2: điểm thứ hai
     * @returns {boolean}
     */
    checkRectX = (p1, p2) =>{
        let pleft = p1;
        let pright = p2;

        if(p1.y > p2.y) {
            pleft = p2;
            pright = p1;
        }

        this.lines = [];
        for(let yi = pleft.y + 1; yi < pright.y; yi++) {
            if(this.checkLineX(pleft.y, yi, pleft.x) && this.checkLineY(pleft.x, pright.x, yi) && this.checkLineX(yi, pright.y, pright.x) && this.state.items[pleft.x][yi] === 0 && this.state.items[pright.x][yi] === 0) {
                if(pleft.x > pright.x) {
                    this.lines.push({x: pleft.x, y: yi, value: 'top_left'}, {x: pright.x, y: yi, value: 'bottom_right'});
                }else{
                    this.lines.push({x: pleft.x, y: yi, value: 'bottom_left'}, {x: pright.x, y: yi, value: 'top_right'});
                }

                return true;
            }
        }

        return false;
    };
    checkRectY = (p1, p2) => {
        let pup = p1;
        let pdown = p2;

        if(p1.x > p2.x) {
            pup = p2;
            pdown = p1;
        }

        this.lines = [];
        for(let xi = pup.x + 1; xi < pdown.x; xi++) {
            if(this.checkLineY(pup.x, xi, pup.y) && this.checkLineX(pup.y, pdown.y, xi) && this.checkLineY(xi, pdown.x, pdown.y) && this.state.items[xi][pup.y] === 0 && this.state.items[xi][pdown.y] === 0) {
                if(pup.y > pdown.y) {
                    this.lines.push({x: xi, y: pup.y, value: 'top_left'}, {x: xi, y: pdown.y, value: 'bottom_right'});
                }else{
                    this.lines.push({x: xi, y: pup.y, value: 'top_right'}, {x: xi, y: pdown.y, value: 'bottom_left'});
                }

                return true;
            }
        }

        return false;
    };

    /**
     * @description kiểm tra nếu hai điểm nằm ở cạnh của hình chữ nhật
     * @param p1: điểm thứ nhất
     * @param p2: điểm thứ hai
     * @returns {boolean}
     */
    checkEdge = (p1, p2) =>{
        let pleft = p1;
        let pright = p2;

        if(p1.y > p2.y) {
            pleft = p2;
            pright = p1;
        }

        let p = {x: pright.x, y: pleft.y};
        if(this.state.items[p.x][p.y] === 0) {
            this.lines = [];

            if(this.checkLineX(p.y, pright.y, p.x) && this.checkLineY(p.x, pleft.x, p.y)) {
                if(pleft.x > pright.x) {this.lines.push({x: p.x, y: p.y, value: 'bottom_right'});} else {this.lines.push({x: p.x, y: p.y, value: 'top_right'});}
                return true;
            }
        }

        this.lines = [];
        p = {x: pleft.x, y: pright.y};
        if(this.state.items[p.x][p.y] !== 0) return false;

        if(this.checkLineX(p.y, pleft.y, p.x) && this.checkLineY(p.x, pright.x, p.y)) {
            if(pleft.x > pright.x) {this.lines.push({x: p.x, y: p.y, value: 'top_left'});} else {this.lines.push({x: p.x, y: p.y, value: 'bottom_left'});}
            return true;
        }

        return false;
    };

    /**
     * @description  kiểm tra nếu hai điểm nằm ngoài biên của hình chữ nhật
     * @param p1: điểm thứ nhất
     * @param p2: điểm thứ hai
     * @param maxY
     * @returns {boolean}
     */
    checkExtendX = (p1, p2, maxY) => {
        let pleft = p1;
        let pright = p2;

        if(p1.y > p2.y) {
            pleft = p2;
            pright = p1;
        }

        // từ trái sang phải
        this.lines = [];
        for(let yi = pleft.y + 1; yi <= pright.y; yi++) {
            this.lines.push({x: pleft.x, y: yi, value: 'horizontal'});
        }

        for(let yi = pright.y + 1; yi <= maxY + 1; yi++) {
            this.lines.push({x: pleft.x, y: yi, value: 'horizontal'}, {x: pright.x, y: yi, value: 'horizontal'});

            if(this.checkLineX(pleft.y, yi, pleft.x) && this.checkLineX(pright.y, yi, pright.x) && this.checkLineY(pleft.x, pright.x, yi) && this.state.items[pleft.x][yi] === 0 && this.state.items[pright.x][yi] === 0) {
                if(pleft.x > pright.x) {
                    this.lines.push({x: pleft.x, y: yi, value: 'top_left'}, {x: pright.x, y: yi, value: 'bottom_left'});
                }else{
                    this.lines.push({x: pleft.x, y: yi, value: 'bottom_left'}, {x: pright.x, y: yi, value: 'top_left'});
                }

                return true;
            }
        }

        // từ phải sang trái
        this.lines = [];
        for(let yi = pright.y - 1; yi >= pleft.y; yi--) {
            this.lines.push({x: pright.x, y: yi, value: 'horizontal'});
        }
        for(let yi = pleft.y - 1; yi >= 0; yi--) {
            this.lines.push({x: pleft.x, y: yi, value: 'horizontal'}, {x: pright.x, y: yi, value: 'horizontal'});

            if(this.checkLineX(pleft.y, yi, pleft.x) && this.checkLineX(pright.y, yi, pright.x) && this.checkLineY(pleft.x, pright.x, yi) && this.state.items[pleft.x][yi] === 0 && this.state.items[pright.x][yi] === 0) {
                if(pleft.x > pright.x) {
                    this.lines.push({x: pleft.x, y: yi, value: 'top_right'}, {x: pright.x, y: yi, value: 'bottom_right'});
                }else{
                    this.lines.push({x: pleft.x, y: yi, value: 'bottom_right'}, {x: pright.x, y: yi, value: 'top_right'});
                }
                return true;
            }
        }

        return false;
    };
    /**
     * Phương pháp này kiểm tra nếu có đường kết nối theo chiều dọc giữa hai điểm p1 và p2
     */
    checkExtendY = (p1, p2, maxX) => {
        let pup = p1;
        let pdown = p2;

        if(p1.x > p2.x) {
            pup = p2;
            pdown = p1;
        }

        // từ trên xuống dưới
        this.lines = [];
        for(let xi = pup.x + 1; xi <= pdown.x; xi++) {
            this.lines.push({x: xi, y: pup.y, value: 'vertical'});
        }

        for(let xi = pdown.x + 1; xi <= maxX + 1; xi++) {
            this.lines.push({x: xi, y: pup.y, value: 'vertical'}, {x: xi, y: pdown.y, value: 'vertical'});
            if(this.checkLineY(pup.x, xi, pup.y) && this.checkLineY(pdown.x, xi, pdown.y) && this.checkLineX(pup.y, pdown.y, xi) && this.state.items[xi][pup.y] === 0 && this.state.items[xi][pdown.y] === 0) {
                if(pup.y > pdown.y) {
                    this.lines.push({x: xi, y: pup.y, value: 'top_left'}, {x: xi, y: pdown.y, value: 'top_right'});
                }else{
                    this.lines.push({x: xi, y: pup.y, value: 'top_right'}, {x: xi, y: pdown.y, value: 'top_left'});
                }
                return true;
            }
        }

        // từ dưới lên trên
        this.lines = [];
        for(let xi = pdown.x - 1; xi >= pup.x; xi--) {
            this.lines.push({x: xi, y: pdown.y, value: 'vertical'});
        }
        for(let xi = pup.x - 1; xi >= 0; xi--) {
            this.lines.push({x: xi, y: pup.y, value: 'vertical'}, {x: xi, y: pdown.y, value: 'vertical'});
            if(this.checkLineY(pup.x, xi, pup.y) && this.checkLineY(pdown.x, xi, pdown.y) && this.checkLineX(pup.y, pdown.y, xi) && this.state.items[xi][pup.y] === 0 && this.state.items[xi][pdown.y] === 0) {
                if(pup.y > pdown.y) {
                    this.lines.push({x: xi, y: pup.y, value: 'bottom_left'}, {x: xi, y: pdown.y, value: 'bottom_right'});
                }else{
                    this.lines.push({x: xi, y: pup.y, value: 'bottom_right'}, {x: xi, y: pdown.y, value: 'bottom_left'});
                }
                return true;
            }
        }

        return false;
    };

    /**
     * @param p1
     * @param p2
     * @returns Trạng thái ăn điểm. True: có thể ăn điểm. False: không.
     */
    isPair = (p1, p2) => {
        if (!p1 || !p2) {
            throw Error('p1, p2 bat buoc co gia tri.');
        }

        const x1 = p1.x;
        const y1 = p1.y;

        const x2 = p2.x;
        const y2 = p2.y;

        if(this.state.items[x1][y1] !== this.state.items[x2][y2] || (x1 === x2 && y1 === y2)) {
            return false;
        }
        // Trường hợp 1: Trên cùng 1 hàng
        if(x1 === x2 && this.checkLineX(y1, y2, x1)) return true;

        // Trường hợp 2: Trên cùng 1 cột
        if(y1 === y2 && this.checkLineY(x1, x2, y1)) return true;

        // Trường hợp 3+4: hai điểm nằm ở cạnh của hình chữ nhật
        if(this.checkEdge(p1, p2)) return true;

        // Trường hợp 5: hai điểm trong biên của hình chữ nhật
        if(this.checkRectX(p1, p2)) return true;

        if(this.checkRectY(p1, p2)) return true;

        // Trường hợp 6: hai điểm ngoài biên của hình chữ nhật
        if(this.checkExtendX(p1, p2, this.col)) return true;

        return this.checkExtendY(p1, p2, this.row);
    };

    /**
     * @description thêm các mục đã nhấp vào trạng thái.
     * @param pi: tọa độ x của mục
     * @param pj: tọa độ y của mục
     */
    handleClick = (pi, pj) => {
        // Kiểm tra nếu mục này nằm ngoài bảng
        if(this.state.items[pi][pj] === 0) return;

        if(!this.state.square1) {
            this.setState({
                square1: {x: pi, y: pj}
            });
            return;
        }

        this.setState({
            square2: {x: pi, y: pj}
        });
    };

    constructor(props) {
        super(props);

        this.row = 7;       // kích thước bảng trò chơi
        this.col = 14;
        this.amount = 36;       // số lượng mục pokemon
        this.lines = [];       // mảng chứa đường nối pokemon (mảng tạm thời cho mỗi lần chạy phương pháp isExist)
        this.lastLines = [];       // mảng chứa đường nối cuối cùng
        this.count = 0;        // số cặp thỏa mãn các trường hợp mục
        this.newItems = [];             // mảng 2 chiều chứa các mục bất cứ khi nào trạng thái mục thay đổi
        this.time = 1000;
        localStorage.setItem('listScore', JSON.stringify([])); // lưu danh sách điểm số vào local storage
        this.listScore = localStorage.getItem('listScore') ? JSON.parse(localStorage.getItem('listScore')) : new Array(5);
        this.listScoreLength = 5;

        const _new = getBoard(this.row, this.col, this.amount);   // tạo bảng trò chơi mới

        this.state = {
            items: _new,
            score: 0,
            square1: null,
            square2: null,
            reload: 10,
            time: this.time,
            level: 1,
            isWillReload: false,
            isJustReloaded: false,
            isNew: false
        };

        this.hasLine = false;
        this.doneLine = false;
        this.listPosItem = getListPosItem(_new, this.row, this.col, this.amount);   // mảng vị trí các mục
        // value of items
        this.satisfiableItems = new Array(this.amount + 1);     // mảng vị trí các mục thoả mãn điều kiện
    }

    /**
     * @description: kiểm tra bảng trò chơi mỗi khi mount
     */
    componentDidMount() {
        if(!this.isExist()) {
            this.reloadHandler();
        }
    }

    componentDidUpdate(prevProps, prevState) {
         // Khi bảng trò chơi được tạo mới
        if(this.state.isNew === true) {
            if(!this.isExist()) {
                this.reloadHandler();
            }

            this.setState({
                isNew: false,
            });
        }

        // Khi bảng trò chơi được reload
        if(this.state.isJustReloaded === true) {
            if(!this.isExist()) {
                this.reloadHandler();
            }

            this.setState({
                isJustReloaded: false,
            });
        }

        // Vòng 5: Kiểm tra reload bảng trò chơi và lên cấp
        if(this.state.isWillReload === true) {
            if(this.state.score === 10 * this.col * this.row * this.state.level) {
                this.doNextLevel();
            }else{
                // cập nhật mảng vị trí các mục
                this.listPosItem = getListPosItem(this.newItems, this.row, this.col, this.amount);

                if(!this.isExist()) {
                    this.reloadHandler();
                }
            }

            this.setState({
                isWillReload: false
            });

            return;
        }

        // Vòng 4: Xóa đường nối khỏi bảng
        if(this.doneLine) {
            this.lastLines.map((line) => this.newItems[line.x][line.y] = 0);

            this.newItems[this.state.square1.x][this.state.square1.y] = this.newItems[this.state.square2.x][this.state.square2.y] = 0;
            this.lastLines = [];
            this.handleLevel(this.state.level);

            setTimeout(
                () => {
                    this.setState({
                        items: this.newItems,
                        square1: null,
                        square2: null,
                        isWillReload: true,
                    });
                }, 500
            );

            this.doneLine = false;
            return;
        }

        // Vòng 3: Hiển thị đường nối đã kết nối
        if(this.hasLine) {
            this.hasLine = false;
            this.doneLine = true;

            this.setState({
                items: this.newItems,
            });

            return;
        }

        // Vòng 1: Kiểm tra nếu 2 mục hợp lệ (không null)
        if (this.state.square1 && this.state.square2) {
            this.newItems = this.state.items.slice();
            const value = this.newItems[this.state.square1.x][this.state.square1.y];

            // Vòng 2: Kiểm tra nếu 2 mục thoả mãn điều kiện. Nếu có, cập nhật điểm số và gán giá trị cho lastLines
            for(i = 0; i < this.satisfiableItems[value].length; i++) { // compare two object
                if ( (this.satisfiableItems[value][i].square1.x === this.state.square1.x
                    && this.satisfiableItems[value][i].square1.y === this.state.square1.y
                    && this.satisfiableItems[value][i].square2.x === this.state.square2.x
                    && this.satisfiableItems[value][i].square2.y === this.state.square2.y)
                    || (this.satisfiableItems[value][i].square2.x === this.state.square1.x
                        && this.satisfiableItems[value][i].square2.y === this.state.square1.y
                        && this.satisfiableItems[value][i].square1.x === this.state.square2.x
                        && this.satisfiableItems[value][i].square1.y === this.state.square2.y)
                ) {
                    this.lastLines = this.satisfiableItems[value][i].lines.slice();

                    if (this.lastLines.length > 0) {
                        this.lastLines.map((line) => this.newItems[line.x][line.y] = line.value);
                    }

                    this.setState({
                        score: prevState.score + 20,
                    });

                    this.hasLine = true;

                    // Xóa khỏi listPosItems
                    this.listPosItem[value][this.satisfiableItems[value][i].item1] = this.listPosItem[value][this.listPosItem[value].length - 1];
                    this.listPosItem[value].pop();
                    this.listPosItem[value][this.satisfiableItems[value][i].item2] = this.listPosItem[value][this.listPosItem[value].length - 1];
                    this.listPosItem[value].pop();

                    // Xóa cặp mục khỏi mảng satisfiableItems
                    this.satisfiableItems[value][i] = this.satisfiableItems[value][this.satisfiableItems[value].length - 1];
                    this.satisfiableItems[value].pop();

                    this.count --;

                    return;
                }
            }

            this.lines = [];
            this.setState({
                square1: null,
                square2: null
            });
        }
    }

    /**
     * Kiem tra xem con truong hop nao an duoc khong??
     * @returns {boolean}
     */
    isExist() {
        this.count = 0; // đặt lại biến đếm

        // Khởi tạo mảng 2 chiều
        this.satisfiableItems = [...Array(this.amount + 1)].fill(null).map(() => []);

        // Duyệt qua từng mục
        for(i = 1; i < this.listPosItem.length; i++) {
            //Trường hợp 1: Không có mục nào
            if(!this.listPosItem[i] || this.listPosItem[i].length === 0) continue;

            // Trường hợp 2: 2, 4, 6... mục
            for(j = 0; j < this.listPosItem[i].length; j++) {
                for(k = j + 1; k < this.listPosItem[i].length; k++) {
                    this.lines = [];
                    if(this.isPair(this.listPosItem[i][j], this.listPosItem[i][k])) {
                        this.satisfiableItems[i].push({square1: this.listPosItem[i][j], square2: this.listPosItem[i][k], lines: this.lines, item1: j, item2: k});
                        this.count ++;
                    }
                }
            }
        }

        return this.count > 0;
    }

    renew() {
        this.saveScore(this.state.score);  // lưu điểm số

        const _newItems = getBoard(this.row, this.col, this.amount); // tạo bảng mới
        this.setState({
            items: _newItems,
            score: 0,
            reload: 10,
            time: this.time,
            level: 1,
            isNew: true
        });

        this.listPosItem = getListPosItem(_newItems, this.row, this.col, this.amount); // cập nhật vị trí các mục
        this.satisfiableItems = new Array(this.amount + 1); // khởi tạo lại mảng các mục thỏa mãn
    }

    /**
     * @description lưu điểm số vào local storage
     * @param score
     */
    saveScore(score){
        if(score > this.listScore[this.listScoreLength - 1] || this.listScore.length < this.listScoreLength){
            this.listScore.push(score);
        }
        localStorage.setItem("listScore", this.listScore.sort((a,b) => b-a )); // sắp xếp và lưu điểm số
    }

    /**
     * @description xử lý khi lên cấp
     * @param level
     */
    handleLevel(level) {
        switch (level) {
            case 2:
                // level2 từ trên xuống dưới
                this.newItems = moveTop2Down(this.newItems, this.state.square1.y);
                this.newItems = moveTop2Down(this.newItems, this.state.square2.y);
                break;

            case 3:
                // level2 từ dưới lên trên
                this.newItems = moveDown2Top(this.newItems, this.state.square1.y);
                this.newItems = moveDown2Top(this.newItems, this.state.square2.y);
                break;

            case 4:
                // level2 từ phải sang trái
                this.newItems = moveRight2Left(this.newItems, this.state.square1.x);
                this.newItems = moveRight2Left(this.newItems, this.state.square2.x);
                break;

            case 5:
                // level2 từ trái sang phải
                this.newItems = moveLeft2Right(this.newItems, this.state.square1.x);
                this.newItems = moveLeft2Right(this.newItems, this.state.square2.x);
                break;

            case 6:
                this.newItems = move3CenterLeftRight(this.newItems, this.state.square1.x, this.state.square1.y);
                this.newItems = move3CenterLeftRight(this.newItems, this.state.square2.x, this.state.square2.y);
                break;

            case 7:
                //  level3 từ giữa trên xuống dưới
                this.newItems = move3CenterTopDown(this.newItems, this.state.square1.y, this.state.square1.x);
                this.newItems = move3CenterTopDown(this.newItems, this.state.square2.y, this.state.square2.x);
                break;

            case 8:
                // level3 từ ngoài vào giữa trái phải
                this.newItems = move3OutLeftRight(this.newItems, this.state.square1.x, this.state.square1.y);
                this.newItems = move3OutLeftRight(this.newItems, this.state.square2.x, this.state.square2.y);
                break;

            case 9:
                // level3 từ ngoài vào giữa trên dưới;
                this.newItems = move3OutTopDown(this.newItems, this.state.square1.x, this.state.square1.y);
                this.newItems = move3OutTopDown(this.newItems, this.state.square2.x, this.state.square2.y);
                break;

            default:
                break;
        }
        
    }

    render() {
        return (
            <div className="game">
                <div className="game-board">

                    <Timer width={this.state.time} onFinishInterval={this.onTimeout} isnew={this.state.isNew} />
                    <Board
                        squares = {this.state.items}
                        onClick={this.handleClick}
                        square1={this.state.square1}
                        square2={this.state.square2}
                    />
                    {/* <Fireworks width={1000} height={1000}></Fireworks> */}
                </div>

                <hr/>

                <div className="score-board">

                    <h2 className={'level'} >Level: {this.state.level}</h2>
                    <h3 className={'score'} >Score: {this.state.score}</h3>
                    <h4 className={'reload'} >Reload Time Count: {this.state.reload}</h4>
                    <button onClick={this.reloadHandler}>Reload</button>
                    <h2>Score: {this.listScore}</h2>
                    <ScoreBoard score={this.listScore}/>
                </div>

            </div>
        );
    }

}

export default Game;
