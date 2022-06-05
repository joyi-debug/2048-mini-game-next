// logs.js
const util = require("../../utils/util.js");
const CANCAS_ID = "canvas";

Page({
  data: {},
  async onLoad() {
    this.canvas = await this.getCanvas();
    this.context = this.canvas.getContext("2d");
  },
  async getCanvas() {
    return new Promise((resolve) => {
      let selQuery = wx.createSelectorQuery();
      console.log("121212");
      //通过css中的ID选择器选中canvas
      selQuery
        .select("#canvas-animation")
        .fields({
          node: true,
          size: true,
        })
        .exec((res) => {
          console.log(res);
          //将数组中的第一个以元素返回
          const canvas = res[0].node;
          resolve(canvas);
        });
    });
  },
  getCanvasContext() {
    return wx.createCanvasContext(CANCAS_ID);
  },
  onDrawRect() {
    //获取canvas上下文
    const context = this.getCanvasContext();
    /* context.rect(0, 0, 200, 200); //绘制矩形
    context.stroke(); //填充矩形 */
    context.fillRect(0, 0, 200, 200);
    context.draw(true); //开始绘制
  },
  onClearRect() {
    const context = this.getCanvasContext();
    context.clearRect(10, 10, 100, 100);
    context.draw(false);
  },
  onDrawTriangle() {
    //绘制三角形
    //获取canvas上下文
    const context = this.getCanvasContext();
    context.beginPath(); //开始path绘制
    //移动画笔到（100，100）
    context.moveTo(100, 100);
    //画线到（160，200）
    context.lineTo(160, 200);
    //画线到（220，100）
    context.lineTo(220, 100);
    context.closePath(); //结束path绘制
    context.stroke(); //画出path线条
    context.draw();
  },
  onDrawArc() {
    //绘制扇形
    const context = this.getCanvasContext();
    context.arc(100, 100, 50, 0, Math.PI);
    context.stroke();
    context.draw();
  },
  onDrawRoundedRect() {
    const points = {
      point1: { x: 100, y: 100 },
      point2: { x: 200, y: 100 },
      point3: { x: 200, y: 200 },
      point4: { x: 100, y: 200 },
    };
    const context = this.getCanvasContext();
    context.beginPath();
    context.moveTo(
      (points.point1.x + points.point2.x) / 2,
      (points.point1.y + points.point2.y) / 2
    ); //移动至正方形上边的中电（起始点）
    //绘制右上方的圆角
    context.arcTo(
      points.point2.x,
      points.point2.y,
      points.point3.x,
      points.point3.y,
      12
    );
    //绘制右下方的圆角
    context.arcTo(
      points.point3.x,
      points.point3.y,
      points.point4.x,
      points.point4.y,
      12
    );
    //绘制左下方的圆角
    context.arcTo(
      points.point4.x,
      points.point4.y,
      points.point1.x,
      points.point1.y,
      12
    );
    //绘制左上方的圆角
    context.arcTo(
      points.point1.x,
      points.point1.y,
      points.point2.x,
      points.point2.y,
      12
    );
    context.closePath(); //闭合path
    context.stroke();
    context.draw(true);
  },
  onDrawSimpleAnimation() {
    const rectSize = 50; //正方形的大小
    const leftTopPoint = {
      //正方形左上角的点
      x: 100,
      y: 140,
    };
    const drawRect = () => {
      //清空画布
      this.context.clearRect(0, 0, 1000, 1000);
      const requestAnimationFrame = this.canvas.requestAnimationFrame;
      //填充矩形
      this.context.fillRect(leftTopPoint.x, leftTopPoint.y, 50, 50);
      //在下一个UI渲染周期再次调用drawRect()
      if (leftTopPoint.x < 200) {
        //当方块左上角横坐标小于100时不断将其向右移动
        leftTopPoint.x += 1;
        requestAnimationFrame(drawRect);
      }
    };
    drawRect(); //开始循环绘制
  },
});
