# Function plotter

I create it for my own mathmatic game,but I think I can publish it independently.

## Example
one line usage

    plotter.plot(canvas,'y=x*x',-10,10); 
    //canvas is a canvas dom object.
    //For 'y=x*x' you can replace it for any JavaScript Formula,the module eval it as a native code.
    
Matlab style

    var pl= new plotter.Plotter({element:canvas,X:[0,10,20,30,40],Y:[10,20,30,40,50]});
    pl.resize();
    pl.draw()
    
    
    

