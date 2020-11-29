# IAT-image-annotation-website
Browser-based image editor for annotating several different structures on an image. Output is a PNG/SVG binary 2D segmentation mask. The output can be used for image segmentation task, such as machine learning semantic segmentation algorithms. This website provides basic drawing, editing, zooming and deleting functionality with free-hand pen-like drawing motion.  


The website has 2 main functionalities **Load File** and **Export File**.
A 2D image can be loaded from disk using  **Load File --> Upload Image** . Several structures (mole, hair, pore, vessel, wrinkle, redness) can be then marked on the image. The brush size is adaptable. The strokes can be deleted (**Draw Stroke/Erase Stroke** toggle button) or undoed(**Undo Stroke**).

The website uses `JavaScript` mainly and it has been inspired by [Raphael-Sketchpad](https://github.com/ianli/raphael-sketchpad).  

## Screenshots of the IAT website

Website after opening `index.html`.
![image](https://user-images.githubusercontent.com/20581812/77459518-20594c80-6e00-11ea-9487-ec09c1d676a8.png)

After annotating some structures:
![example_readme_2](https://user-images.githubusercontent.com/20581812/77459704-6ca48c80-6e00-11ea-8283-19d22f14bb8a.PNG)

## Saving
Saving of the annotations can be done in 3 different format, **PNG**, **SVG** and **JSON**. Each annotation structure is exported individually in a single file. Exception is the **JSON** file, for which only a file is generated exclusive of the number of structures present. 

## MASK (Re)-Loading
Previous annotations can be reloaded onto the picture for editing or verification purposes. To accomplish this, first load the image (png) , then load the corresponding *.json* file from **Load File --> Load Layers** option.

## Layer editing
More layers can be added. The existing ones can also be re-named.
