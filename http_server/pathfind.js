var maths = require('mathjs');

function sleep(milliseconds) {
    const date = Date.now();
    let currentDate = null;
    do {
        currentDate = Date.now();
    } while (currentDate - date < milliseconds);
}

//place pivot off a given obstacle, for a defined path slope
function placePivot(halfspan, margin, radius, centre, relativePos, Iy, cplxcoeff, startpt, endpt){

    //shifted and rotated path bounds for finding middle point
    var starttemp, desttemp;
    //angles in the obstacle diagram
    var smalloppositestart, smalloppositedest, bigoppositestart, bigoppositedest;
    //distance to start and end plus Ycoord
    var startI, destI
    //distance between the obstace origin and the start or destination
    var startO, destO;
    //offset computed from obstacle centre to position of path corner
    var offset;
    //return any new corners
    var pathcorner;

    //feels more right to recompute start temp, but may not be needed, check when implementation is done
    starttemp = maths.multiply( maths.subtract(startpt, centre), cplxcoeff.conjugate() );
    desttemp = maths.multiply( maths.subtract(endpt, centre), cplxcoeff.conjugate() );
    startI = Math.abs(maths.re(starttemp));
    destI = Math.abs(maths.re(desttemp));
    startO = (starttemp.toPolar()).r;
    destO = (desttemp.toPolar()).r;

    if(relativePos+1){
        console.log("above");
    } else {
        console.log("below");
    }

    //compute distance with both sides to ensure margin is met
    //place the pivot on the side of the obstacle with the path
    if( (Iy < 0 && !(relativePos+1)) || (Iy > 0 && (relativePos+1)) ){
        console.log("--same side");
        //for safety, compute the corner coordinates with the values from the closest of start/dest to obstacle origin
        if(startO < destO){
            console.log("info:");
            console.log(startO);
            console.log(startI);
            console.log(halfspan);
            console.log(margin);
            console.log(radius);
            smalloppositestart = Math.acos( ((halfspan+margin+radius)/startO) );
            //console.log(smalloppositestart);
            bigoppositestart = Math.asin( (startI/startO) );
            //console.log(bigoppositestart);
            offset = (halfspan+margin+radius)/Math.cos( (bigoppositestart - smalloppositestart) );
            pathcorner = maths.add(maths.multiply(cplxcoeff, maths.complex(0, relativePos*offset) ), centre);
            //console.log(pathcorner);
            return pathcorner;

        } else {
            console.log("info:");
            console.log(destO);
            console.log(destI);
            console.log(halfspan);
            console.log(margin);
            console.log(radius);
            console.log(centre);
            console.log(startpt);
            console.log(endpt);
            console.log(desttemp);
            //console.log( halfspan+margin+radius );
            smalloppositedest = Math.acos( ((halfspan+margin+radius)/destO) );
            console.log(smalloppositedest);
            bigoppositedest = Math.asin( (destI/destO) );
            console.log(bigoppositedest);
            offset = (halfspan+margin+radius)/Math.cos(( bigoppositedest - smalloppositedest) );
            pathcorner = maths.add(maths.multiply(cplxcoeff, maths.complex(0, relativePos*offset) ), centre);
            //console.log(pathcorner);
            return pathcorner;
        }
    //place the pivot opposite the side of the obstacle with the path
    } else if( (Iy < 0 && (relativePos+1)) || (Iy > 0 && !(relativePos+1)) ){
        console.log("--opposite side");

        if(startO < destO){
            console.log("info:");
            console.log(startO);
            console.log(startI);
            console.log(halfspan);
            console.log(margin);
            console.log(radius);
            smalloppositestart = Math.acos( (halfspan+margin+radius)/startO );
            console.log(smalloppositestart);
            bigoppositestart = Math.asin(startI/startO);
            console.log(bigoppositestart);
            offset = (halfspan+margin+radius)/Math.cos(Math.PI - bigoppositestart - smalloppositestart);
            console.log(offset);
            pathcorner = maths.add(maths.multiply(cplxcoeff, maths.complex(0, relativePos*offset) ), centre);
            return pathcorner;
        } else {
            smalloppositedest = Math.acos( (halfspan+margin+radius)/destO);
            //console.log(smalloppositedest);
            bigoppositedest = Math.asin(destI/destO);
            //console.log(bigoppositedest);
            offset = (halfspan+margin+radius)/Math.cos(Math.PI - bigoppositedest - smalloppositedest);
            //console.log(destoffset);
            pathcorner = maths.add(maths.multiply(cplxcoeff, maths.complex(0, relativePos*offset) ), centre);
            return pathcorner;
        }
    } else {
        console.log("--path through centre");
        //for safety, compute the corner coordinates with the values from the closest of start/dest to obstacle origin
        if(startO < destO){
            smalloppositestart = Math.acos( ((halfspan+margin+radius)/startO) );
            //console.log(smalloppositestart);
            offset = (halfspan+margin+radius)/Math.cos((Math.PI/2 - smalloppositestart) );
            //console.log(startoffset);
            pathcorner = maths.add(maths.multiply(cplxcoeff, maths.complex(0, relativePos*offset) ), centre);
            //console.log(pathcorner);
            return pathcorner;
        } else {
            smalloppositedest = Math.acos(( (halfspan+margin+radius)/destO) );
            //console.log(smalloppositedest);
            offset = (halfspan+margin+radius)/Math.cos((Math.PI/2 - smalloppositedest) );
            //console.log(destoffset);
            pathcorner = maths.add(maths.multiply(cplxcoeff, maths.complex(0, relativePos*offset) ), centre);
            //console.log(pathcorner);
            return pathcorner;
        }
    }

}

//check that a pivot position isn't too close to another obstacle, if so recursively call on the obstacle and forward the pivot, else place
function checkPivot(checked, hitboxlist, hitboxindex, halfspan, margin, relativePos, Iy, cplxcoeff, startpt, endpt){

    var radius = (maths.re(hitboxlist[hitboxindex][1]) - maths.re(hitboxlist[hitboxindex][2]) )/2;
    var centre = maths.divide(maths.add(hitboxlist[hitboxindex][0], hitboxlist[hitboxindex][2]), 2);
    var pivot;
    var starttemplocal, Iylocal, slopelocal, anglelocal, coefflocal;

    /*console.log("placement parameters:")
    console.log(hitboxindex);
    console.log(halfspan);
    console.log(margin);
    console.log(relativePos);
    console.log(Iy);
    console.log(cplxcoeff);
    console.log(startpt);
    console.log(endpt);*/

    checked[hitboxindex] = 1;
    pivot = placePivot(halfspan, margin, radius, centre, relativePos, Iy, cplxcoeff, startpt, endpt);
    //sleep(1000);
    console.log("placed pivot:");
    console.log(pivot);
    //console.log("slope a:");
    //console.log((maths.im(startpt)-maths.im(endpt))/(maths.re(startpt)-maths.re(endpt)));

    //examine all obstacles for potential collision and replace pivot if need be
    for(var i=0; i<hitboxlist.length; i++){
        if(i != hitboxindex){
            centre = maths.divide(maths.add(hitboxes[i][0], hitboxes[i][2]), 2);
            /*console.log("obstacle centre and distance to pivot");
            console.log(centre);
            console.log( (maths.subtract(pivot, centre)).toPolar().r )*/

            //the observed obstable is too close to the pivot, but far enough from the path bounds (prevent illegal trigonometry)
            //and hasn't been examined yet (prevent infinite recursion)
            //first two conditions mean that the path bounds must never be too close to an obstacle, shouldn't happen as long as it isn't true of the initial path
            //if we want to investigate an obstacle, there has to be a workaround (shouldn't be difficult)
            if( (((maths.subtract(pivot, centre)).toPolar().r) <= (halfspan+margin))
             && (((maths.subtract(startpt, centre)).toPolar().r) > (halfspan+margin+radius))
             && (((maths.subtract(endpt, centre)).toPolar().r) > (halfspan+margin+radius))
             && !checked[i]){

                //console.log("slope b:");
                //console.log((maths.im(pivot)-maths.im(endpt))/(maths.re(pivot)-maths.re(endpt)));
                starttemplocal = maths.multiply( maths.subtract(startpt, centre), cplxcoeff.conjugate() );
                Iylocal = maths.im(starttemplocal);
                //pivot = checkPivot(hitboxlist, i, halfspan, margin, relativePos, Iylocal, coefflocal, pivot, endpt);

                checked[i] = 1;

                console.log("pivot relocated to obstacle:");
                console.log(centre);
                pivot = checkPivot(checked, hitboxlist, i, halfspan, margin, relativePos, Iylocal, cplxcoeff, startpt, endpt);

                return pivot;
            }
        }
    }

    return pivot;

}

//for a given path segment, detect collision with axis-aligned hitboxes, then adjust path wrt to path aligned hitbox
function checksegment(startpt, endpt, hitboxes, halfspan, margin){

    var pathslope, yintercept;
    var pathangle, cplxcoeff;
    if(maths.re(endpt) - maths.re(startpt)){
        pathslope = ( maths.im(endpt)-maths.im(startpt) )/( maths.re(endpt)-maths.re(startpt) );
        yintercept = maths.im(startpt) - maths.re(startpt)*pathslope;
        pathangle = Math.atan(pathslope);
        cplxcoeff = maths.complex(Math.cos(pathangle), Math.sin(pathangle));
    } else {
        //in loop return a pivot level with the obstacle if the path is parallel to the y-axis (undefined slope)
        pathslope = null;
        yintercept = null;
        pathangle = null;
        cplxcoeff = null;
    }

    //shifted and rotated path bounds for finding middle point
    var starttemp;
    //interesction I between path and perpedicular going through the obstacle centre and distance to start of path,
    // Ycoord
    var Iy;
    //return any new corners
    var pathcorner;

    //to allow for sorting of the hitbox array, compute obstacle radius and centre instead of using the circle array
    var radius, centre;

    var verticalHitDistance;
    var cnum = hitboxes.length;

    //1 for a pivot over the obstacle, -1 for under
    var relativePos;

    var cornera, cornerb, cornerc, cornerd;

    var memoisation = new Array(cnum).fill(0);

    for(var i=0; i<cnum; i++){

        //assume the rover has no length, so no collisions occur from the front bumping into an obstacle placed just after the destinations
        if(Math.min(maths.re(startpt), maths.re(endpt)) < maths.re(hitboxes[i][2]) && maths.re(hitboxes[i][2])  < Math.max(maths.re(startpt), maths.re(endpt))
        || Math.min(maths.re(startpt), maths.re(endpt)) < maths.re(hitboxes[i][1]) && maths.re(hitboxes[i][1]) < Math.max(maths.re(startpt), maths.re(endpt)) ){

            radius = (maths.re(hitboxes[i][1]) - maths.re(hitboxes[i][2]) )/2;
            centre = maths.divide(maths.add(hitboxes[i][0], hitboxes[i][2]), 2);

            if(pathslope === null){

                console.log("----" + i);
                //in loop return a pivot level with the obstacle if the path is parallel to the y-axis (undefined slope)
                pathcorner = centre + maths.complex(radius + halfspan + margin, 0);
                return pathcorner;
                //pivots.push(pathcorner);
            } else {

                //compute hit distance, the hypothenuse of the triangle with sides width+margin and part of the path
                //hit condition makes the assumption that obstacles are less wide than the rover, so all collisions include hitbox corners

                verticalHitDistance = (halfspan+margin)/(Math.cos(pathangle) );

                //rotate hitboxes to align with path
                //might have been simpler to rotate the path or something
                cornera = maths.add(maths.multiply(maths.subtract(hitboxes[i][0], centre), cplxcoeff), centre);
                cornerb = maths.add(maths.multiply(maths.subtract(hitboxes[i][1], centre), cplxcoeff), centre);
                cornerc = maths.add(maths.multiply(maths.subtract(hitboxes[i][2], centre), cplxcoeff), centre);
                cornerd = maths.add(maths.multiply(maths.subtract(hitboxes[i][3], centre), cplxcoeff), centre);

                //console.log(pathangle);
                //console.log(verticalHitDistance);
                //console.log( (maths.re(hitboxes[i][0])*pathslope+yintercept-verticalHitDistance) + "|" + (maths.re(hitboxes[i][1])*pathslope+yintercept-verticalHitDistance) + "|" + (maths.re(hitboxes[i][2])*pathslope+yintercept-verticalHitDistance) + "|" + (maths.re(hitboxes[i][3])*pathslope+yintercept-verticalHitDistance) );
                //console.log( (maths.re(hitboxes[i][0])*pathslope+yintercept+verticalHitDistance) + "|" + (maths.re(hitboxes[i][1])*pathslope+yintercept+verticalHitDistance) + "|" + (maths.re(hitboxes[i][2])*pathslope+yintercept+verticalHitDistance) + "|" + (maths.re(hitboxes[i][3])*pathslope+yintercept+verticalHitDistance) );
                //console.log( cornera + "/"+ cornerb + "/" + cornerc + "/" + cornerd );

                if( ( (maths.re(hitboxes[i][0])*pathslope+yintercept-verticalHitDistance < maths.im(cornera) ) && ( maths.im(cornera) < maths.re(hitboxes[i][0])*pathslope+yintercept+verticalHitDistance) )
                || ( (maths.re(hitboxes[i][1])*pathslope+yintercept-verticalHitDistance < maths.im(cornerb) ) && ( maths.im(cornerb) < maths.re(hitboxes[i][1])*pathslope+yintercept+verticalHitDistance) )
                || ( (maths.re(hitboxes[i][2])*pathslope+yintercept-verticalHitDistance < maths.im(cornerc) ) && ( maths.im(cornerc) < maths.re(hitboxes[i][2])*pathslope+yintercept+verticalHitDistance) )
                || ( (maths.re(hitboxes[i][3])*pathslope+yintercept-verticalHitDistance < maths.im(cornerd) ) && ( maths.im(cornerd) < maths.re(hitboxes[i][3])*pathslope+yintercept+verticalHitDistance) ) ){

                    console.log("----" + i);
                    console.log("collision registered at:");
                    console.log(centre);
                    console.log("collision real parameters:");
                    console.log(Math.min(maths.re(startpt), maths.re(endpt)));
                    console.log(maths.re(hitboxes[i][2]));
                    console.log(maths.re(hitboxes[i][1]));
                    console.log(Math.max(maths.re(startpt), maths.re(endpt)));

                    starttemp = maths.multiply( maths.subtract(startpt, centre), cplxcoeff.conjugate() );
                    Iy = maths.im(starttemp);


                    //heuristic: shorten travel by placing pivot point on side of obstacle closest to original path
                    //simply, place the pivot on top of the unrotated box instead of below
                    if(Iy < 0){

                        console.log("---below");
                        relativePos = -1;
                        //pathcorner = placePivot(halfspan, margin, radius, centre, relativePos, Iy, cplxcoeff, startpt, endpt);
                        //console.log("path angle:");
                        //console.log(pathangle);
                        pathcorner = checkPivot(memoisation, hitboxes, i, halfspan, margin, relativePos, Iy, cplxcoeff, startpt, endpt);
                        return pathcorner;

                    } else if (Iy > 0){

                        console.log("---above");
                        relativePos = 1;
                        //pathcorner = placePivot(halfspan, margin, radius, centre, relativePos, Iy, cplxcoeff, startpt, endpt);
                        pathcorner = checkPivot(memoisation, hitboxes, i, halfspan, margin, relativePos, Iy, cplxcoeff, startpt, endpt);
                        return pathcorner;

                    } else {

                        console.log("---at");
                        //arbitrary
                        relativePos = -1;
                        //pathcorner = placePivot(halfspan, margin, radius, centre, relativePos, Iy, cplxcoeff, startpt, endpt);
                        pathcorner = checkPivot(memoisation, hitboxes, i, halfspan, margin, relativePos, Iy, cplxcoeff, startpt, endpt);
                        return pathcorner;

                    }

                }

            }
        }
    }

    return null;
}

//generate an hitboxes corresponding to each circular obstacle
//current only works for circles of radius 1
function generateHitboxes (obstaclearray){

    var hitboxarray = [];
    var corners
    var onum = obstaclearray.length;

    for(var i=0; i<onum; i++){
        //list square corners clockwise from top-right
        corners = [ maths.add(obstaclearray[i].centre, '1+i') , maths.add(obstaclearray[i].centre, '1-i'), maths.add(obstaclearray[i].centre, '-1-i'), maths.add(obstaclearray[i].centre, '-1+i') ];
        hitboxarray.push(corners);
    }

    return hitboxarray;
}

//comparison function for sorting hitbox arrays by lowest real part (leftmost reach)
function boxCompare (a, b){
    //console.log(a);
    //console.log(b);
    if(maths.re(a[2]) < maths.re(b[2])){
        return -1;
    } else if(maths.re(a[2]) > maths.re(b[2])){
        return 1;
    } else {
        return 0;
    }
}

//insert new obstacle, return updated obstacle and hitbox arrays
exports.addObstacle = function(newObtacle, knownObstacles){
    var allObstacles = knownObstacles;
    allObstacles.push(newObtacle);
    var allHitboxes = generateHitboxes(knownObstacles);
    allHitboxes.sort(boxCompare);

    return[allObstacles, allHitboxes];
}

//top level pathfinding function returning path with new obstacle avoidance pivot points
exports.pathAdjust = function(originalPath, obstacleArray, hitboxArray, roverWidth, safetyMargin){

    //centre-extreme width of rover
    var halfwidth = roverWidth/2;
    //the path is deemed safe when all obstacles have been iterated through without any alteratiobs being needed
    var unaltered = 0;
    //start and end points of current path segment
    var beginpt, destpt;
    //temp array for new pivot points
    //var newpivots;
    var newpivot;

    //until an unaltered path is found, iterate over all path segments
    while(!unaltered){

        console.log("||||");

        unaltered = 1;

        for(var s = 0; s<originalPath.length-1; s++){

            console.log(originalPath);
            console.log("////" + s);

            beginpt = originalPath[s];
            destpt = originalPath[s+1];

            newpivot = checksegment(beginpt, destpt, hitboxArray, halfwidth, safetyMargin);
            //console.log("new pivots:");
            //console.log(newpivots);
            /*for(var i=newpivots.length-1; i>=0; i--){
                originalPath.splice(s+1, 0, newpivots[i]);
            }*/
            if(newpivot === null){
                unaltered &= 1;
            } else {
                unaltered &= 0;
                originalPath.splice(s+1, 0, newpivot);
            }

            //console.log("new path:");
            //console.log(originalPath);
            //unaltered &= !(newpivots.length);
            sleep(1000);
        }
    }

    return originalPath;
}

//each obstacle is assumed or assimilated circular in the plane of collision with the rover
/*var circa = {centre: maths.complex(3, 3), radius: 1};
var circb = {centre: maths.complex(5, 0), radius: 1};
var circc = {centre: maths.complex(8, 2), radius: 1};
var circd = {centre: maths.complex(6, 5), radius: 1};
var circe = {centre: maths.complex(10, 4), radius: 1};
var circf = {centre: maths.complex(9, 7), radius: 1};
var circh = {centre: maths.complex(8,-2), radius: 1};
var circj = {centre: maths.complex(-4,8), radius: 1};
var circk = {centre: maths.complex(5,-4), radius: 1};
var circlearray = [];

//var hitboxes = generateHitboxes(circlearray);
var hitboxes;

[circlearray, hitboxes] = addObstacle(circa, circlearray);
[circlearray, hitboxes] = addObstacle(circb, circlearray);
[circlearray, hitboxes] = addObstacle(circc, circlearray);
[circlearray, hitboxes] = addObstacle(circd, circlearray);
[circlearray, hitboxes] = addObstacle(circe, circlearray);
[circlearray, hitboxes] = addObstacle(circf, circlearray);
[circlearray, hitboxes] = addObstacle(circh, circlearray);
[circlearray, hitboxes] = addObstacle(circj, circlearray);
[circlearray, hitboxes] = addObstacle(circk, circlearray);

console.log("hitboxes:");
console.log(hitboxes);

//start by assuming a straight A to B path that doesn't have un undefined slope
var path = [maths.complex(0,0), maths.complex(13, 2)];

//rover width characterstics
var totalSpan = 4;
var widthmargin = 0.2; //10% of halfspan sounds like a good margin, maybe start lower and increase as measurements get less precise

console.log("starting pathfinding:");

path = pathAdjust(path, circlearray, hitboxes, totalSpan, widthmargin);

console.log("new path:");
console.log(path);*/
