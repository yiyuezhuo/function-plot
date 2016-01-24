(function(){
	//该类进行matlab式画图，不管理函数
	Plotter=function(opts){
		this.opts=opts;
		this.element=opts.element;
		this.X=opts.X;
		this.Y=opts.Y;
		this.xLabel=opts.xLabel;
		this.yLabel=opts.yLabel;
		this.width=opts.width ? opt.width : 400;
		this.height=opts.height ? opt.height : 400;
		this.element.setAttribute('width',this.width);
		this.element.setAttribute('height',this.height);
		this.locX=0;
		this.locY=0;
		this.scaleX=1;
		this.scaleY=1;
		//this.func=opts.func;//func是y-x型函数，接受一个值返回一个值，目前限制在这个最简单的情况。
	};
	Plotter.prototype.setX=function(X){
		this.X=X;
	}
	Plotter.prototype.setY=function(Y){
		this.Y=Y;
	}
	Plotter.prototype.draw=function(){
		//这里的写法是numpy 或者说matlab写法，即双数组对齐模式，这里是this.X,this.Y。应该在之前初始化或者setX中被处理过
		var canvas= this.element;
		var ctx=canvas.getContext('2d');
		var locX=this.locX;
		var locY=this.locY;
		var scaleX=this.scaleX;
		var scaleY=this.scaleY;
		
		ctx.strokeStyle='blue';
		ctx.beginPath();
		ctx.moveTo((this.X[0]-this.locX)/scaleX,(this.Y[0]-this.locY)/scaleY)
		var i;
		for(i=0;i<this.X.length;i++){
			var x=(this.X[i]-this.locX)/scaleX;
			var y=(this.Y[i]-this.locY)/scaleY;
			//ctx.lineTo(x,y);
			ctx.lineTo(x,this.height-y);//仅在这一步进行实质反转
			//console.log(x,y)
		}
		ctx.stroke();
	}
	Plotter.prototype.clear=function(){
		this.element.getContext('2d').clearRect(0,0,this.width,this.height);
	}
	Plotter.prototype.resize=function(){
		//resize只修改loc与scale，不变换this.X,this.Y的值
		//this.X.reduce(function(x,y){return Math.min(x,y)})
		//minX=Math['min'].apply(Math,this.X);
		var that=this;
		//var mat= ['min','max'].map(function(f){return [that.X,that.Y].map(function(value){return [f,value]})});
		var mat= ['min','max'].map(function(f){return [that.X,that.Y].map(function(value){return Math[f].apply(Math,value)})});
		var minX=mat[0][0];var minY=mat[0][1];var maxX=mat[1][0];var maxY=mat[1][1];
		//console.log(minX,minY,maxX,maxY);
		//console.log(mat);
		this.locX=minX;
		this.locY=minY;
		this.scaleX=(maxX-minX)/this.width;
		this.scaleY=(maxY-minY)/this.height;
	}
	Plotter.prototype.plotFormula=function(formula,left,right){
		var step=(right-left)/this.width;
		var i,j=left;
		var l=[];
		for(i=0;i<this.width;i++){
			l.push(j);
			j=j+step;
		}
		
		var parser=new Parser(formula);
		parser.parse();		
		this.plot(l,parser.broadcast(l));
	}
	Plotter.prototype.plot=function(X,Y){
		//draw是直接画到双坐标指定的^canvas^坐标，而plot是带了resize的
		this.X=X;
		this.Y=Y;
		this.resize();
		this.draw();
	}
	Plotter.prototype.drawAxis=function(n){
		//默认只画10个每边
		var ctx=this.element.getContext('2d');
		var that=this;
		
		var mat= ['min','max'].map(function(f){return [that.X,that.Y].map(function(value){return Math[f].apply(Math,value)})});
		var minX=mat[0][0];var minY=mat[0][1];var maxX=mat[1][0];var maxY=mat[1][1];
		console.log('minmax',minX,maxX,minY,maxY);
		var i;
		n=n ? n: 10;
		for(i=1;i<n+1;i++){
			var x=minX+(maxX-minX)*(i/n);
			var y=minY;
			var px=(x-this.locX)/this.scaleX;
			var py=(y-this.locY)/this.scaleY;
			ctx.fillText(cutNumberString(x),px,this.height-(py));
			console.log(x,y,px,py);
		}
		for(i=1;i<n+1;i++){
			var x=minX;
			var y=minY+(maxY-minY)*(i/n);
			var px=(x-this.locX)/this.scaleX;
			var py=(y-this.locY)/this.scaleY;
			ctx.fillText(cutNumberString(y),px,this.height-py);
			console.log(x,y,px,py);
		}

	}
	
	function simpleExpon(n){
		var s=String(n);
		if (s.indexOf('-')===-1){
			return s[0]+s.slice(s.indexOf('e'));
		}
		else{
			return s[0]+s[1]+s.slice(s.indexOf('e'));
		}
	}
	function cutNumberString(n){
		var s=String(n);
		if (s.indexOf('e')!==-1){
			//若一开始就是指数形式，直接截断
			return simpleExpon(n);
		}
		else if (s.length>6){
			//若一开始不是指数形式但原形式长于6，转成指数形式截断
			//return simpleExpon(n.toExponential());
			if(s.indexOf('.')!==-1 && s.indexOf('.')+2<=5){
				return s.slice(0,s.indexOf('.')+2)
			}
			else{
				return simpleExpon(n.toExponential());
			}
		}
		else{
			return n;
		}
	}
	/*
	function cutNumberString(n){
		var s= String(n);
		if (s.length<=4){
			return s;
		}
		else if (s.indexOf('e')!==-1){
			if (s.indexOf('-')===-1){
				return s.slice(0,1)+s.slice(s.indexOf('e'));
			}
			else{
				return 0;
			}
		}
		else{
			return s.slice(0,4)
		}
	}
	*/
	
	//该类接收一个表达式并对应为函数，还能抽样一些点
	Parser= function(exp){
		this.exp=exp;
		//this.func;
	}
	Parser.prototype.parse=function(){
		var x,y;
		var that=this;
		//var evalS='function(){'+this.exp.replace("y",'return ')+';}';
		//evalS=evalS.replace('=','');
		//console.log(evalS);
		var s=this.exp.replace('y','').replace('=','');
		var f=function(x){
			return eval(s);
		}
		this.func=f;
		return f;
	}
	Parser.prototype.apply=function(x){
		if (!(this.func)){
			console.log(parse);
			this.func=this.parse();
		}
		return this.func(x);
	}
	Parser.prototype.broadcast=function(X){
		if (typeof(X)===typeof(1)){
			return this.apply(X);
		}
		else{
			var that=this;
			return X.map(function(x){return that.apply(x)});
		}
	}
	
	function plot(canvas,formula,left,right){
		var pl=new plotter.Plotter({element:canvas});
		pl.clear();
		pl.plotFormula(fText.value,left,right);
		pl.drawAxis();
		return pl;
	}
	
	window.plotter={};
	window.plotter.Plotter=Plotter;//导出Plotter类，该类用来进行matlab式画图，并不处理函数形式
	window.plotter.Parser=Parser;
	window.plotter.plot=plot;
})();


function test(){
	
	var body= document.getElementsByTagName("body")[0];
	var canvas= document.createElement("canvas");
	body.appendChild(canvas);
	/*
	//var plotter= new plotter.Plotter({element:canvas,X:[0,10,20,30,40],Y:[10,20,30,40,50]});
	var pl= new plotter.Plotter({element:canvas,X:[0,10,20,30,40],Y:[10,20,30,40,50]});
	pl.resize();
	pl.draw()*/
	plotter.plot(canvas,'y=x*x',-10,10);
	
	
	
	var parser=new plotter.Parser('y=x*x');
	var f=parser.parse();
	console.log([1,2,3,4,5,6,7].map(x=>f(x)));
	console.log(parser.broadcast([1,2,3,4,5,6,7]));
	
	var fText=document.getElementById("fText");
	var lText=document.getElementById("lText");
	var rText=document.getElementById("rText");
	var pButton=document.getElementById("pButton");
	
	function callback(){
		/*
		var pl=new plotter.Plotter({element:canvas});
		pl.clear();
		pl.plotFormula(fText.value,-10,10);
		pl.drawAxis();
		*/
		plotter.plot(canvas,fText.value,Number(lText.value),Number(rText.value));
	};
	pButton.onclick=callback;
}