/** ---------------------------------------------------------------- role.mover ----------------------------------------------------------------
 * @param {Creep} creep 
 * by Urakake     **/
		
var roleMover = {
    run: function(creep) {
        if(!creep.memory.init){
            init(creep);
        }
        work(creep);
	},
	makeMover: function(spawn) {
	    var cap = spawn.room.energyAvailable;
	    var creepName = "mover"+Game.time+"@"+spawn.room.name+"@"+spawn.name;
	    var missingBin = getMissingSourceBinId(spawn.room);
	    console.log("Creating Creep ("+creepName+")");
	    return spawn.createCreep( makeBestBody(cap), creepName, { role: 'mover', sourceBin: missingBin } );
	},
	checkMovers: function(myRoom) {
    	var foundMissing=false;
        if(getMissingSourceBinId(myRoom) != undefined){
            foundMissing=true;
        }
        return foundMissing;
	}
};
function getMissingSourceBinId(thisRoom){
    var srcId;
    var myRoom=thisRoom;
    var missingNum=-1;
    for(var i in myRoom.memory.moverNames){
        var thisName=myRoom.memory.moverNames[i];
        var thisCreep=Game.creeps[thisName];
        if(thisCreep==undefined){
            myRoom.memory.moverNames[i]="";
            missingNum=i;
        }
    }
    if(missingNum>=0){                    //  found missing bin
        srcId = myRoom.memory.sourceBins[missingNum];
    }  else {
        for (var i in myRoom.memory.miningRooms){    //   look in  mining rooms
            myRoom=Game.rooms[myRoom.memory.miningRooms[i]];
            if(myRoom!=undefined){
                for(var i in myRoom.memory.moverNames){
                    var thisName=myRoom.memory.moverNames[i];
                    var thisCreep=Game.creeps[thisName];
                    if(thisCreep==undefined){
                        myRoom.memory.moverNames[i]="";
                        missingNum=i;
                    }
                }
                if(missingNum>=0){                           //  found missing bin
                    return myRoom.memory.sourceBins[missingNum];
                } else {
                    return undefined;
                }
            } else {
                //mining room undefinedc
            }
        }
    }
    return srcId;
}
function work(creep) {
    if(creep.memory.state == "acquireEnergy"){
		acquireEnergy(creep);
	} else if(creep.memory.state == "dumpEnergy"){
	    dumpEnergy(creep);
	}
}
function acquireEnergy(creep) {
    var target;
    if(creep.memory.sourceBin==undefined){
        if(creep.memory.targetSource==undefined){   // no bin no target
            target = findSource(creep);
        } else {                                    // no bin yes target
            target = Game.getObjectById(creep.memory.targetSource);
            if(containerEmpty(target)){
                target = findSource(creep);
                creep.memory.targetSource=target;
            }
        }
    } else {                                        // yes bin
        target = Game.getObjectById(creep.memory.sourceBin);
    }
    if(target){                                     // go get energy
        if(creep.memory.pickupFlag){
            moveToPickup(creep,target);
        } else {
            moveToGetTransfer(creep,target);
        }
    }
    if(creep.carry.energy==creep.carryCapacity){    // full energy
        creep.memory.targetSource=undefined
        creep.memory.state = "dumpEnergy";
    }
}
function dumpEnergy(creep) {
    var target;
    if(creep.memory.destBin==undefined){
        if(creep.memory.targetDest==undefined){     // no bin no target
            target = findDest(creep);
        } else {                                    // no bin yes target
            target = Game.getObjectById(creep.memory.targetDest);
            //
            if(containerAtCap(target)){
                target = findDest(creep);
            }  
        }
    } else {                                        // yes bin
        target = Game.getObjectById(creep.memory.destBin);
    }
    if(target){
        moveToGiveTransfer(creep,target);
    } else {
        creep.memory.state = "acquireEnergy";
    }
    if(creep.carry.energy==0){                      // out of energy
        creep.memory.targetDest=undefined;
        creep.memory.state = "acquireEnergy";
    }
    
}
function voyageOutOfRoom(creep,destRoom) {
    var exitDir = Game.map.findExit(creep.room.name, destRoom);
    var Exit = creep.pos.findClosestByPath(exitDir);
    creep.moveTo(Exit);
}
function moveToPickup(creep,target) {
    if(target){
        if(creep.room.name==target.room.name){
            if(creep.pickup(target, RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) {
                    creep.moveTo(target);
            } else {
                creep.memory.targetSource=undefined;
            }
        } else {
            voyageOutOfRoom(creep,target.room)
        }
    } else {
        creep.memory.targetSource=undefined;
        //findSource(creep);
    }
}
function moveToGetTransfer(creep,target) {
    if(target.store[RESOURCE_ENERGY]>0){
        if(creep.room.name==target.room.name){
            if(target.transfer(creep, RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) {
                    creep.moveTo(target);
            } else {
                creep.memory.targetSource=undefined;
            }
        } else {
            voyageOutOfRoom(creep,target.room)
        }
        
    } else {
        creep.memory.targetSource=undefined;
    }
}
function moveToGiveTransfer(creep,target) {
    if(!containerAtCap(target)){
        if(creep.room.name==target.room.name){
            if(creep.transfer(target, RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) {
                    creep.moveTo(target);
            } else {
                creep.memory.targetDest=undefined;
            }
        } else {
            voyageOutOfRoom(creep,target.room)
        }
    } else {
        findDest(creep);
    }
}
function findDest(creep) {
    var destBins=[];
    for(var i in creep.room.memory.destBins){
        var destBin=Game.getObjectById(creep.room.memory.destBins[i]);
        if(destBin && !containerAtCap(destBin)){
            destBins.push(destBin);
        }
    }
    //    stuff that really needs energy
    var targets = creep.room.find(FIND_STRUCTURES, {
        filter: (structure) => {
             return ((structure.structureType == STRUCTURE_EXTENSION || structure.structureType == STRUCTURE_SPAWN) && (structure.energy < structure.energyCapacity) ||
                (structure.structureType == STRUCTURE_TOWER) && (structure.energy < structure.energyCapacity*.75))
        }
    });
    if(targets.length){
        var target = creep.pos.findClosestByRange(targets);
        creep.memory.targetDest=target.id;
        return target;
        
    } else {     //   find a destination bin
        var foundBin=false;
        if (destBins.length>0){
            var target = creep.pos.findClosestByRange(destBins);
            //console.log(target)
            if (target.store[RESOURCE_ENERGY]==target.storeCapacity){   //  closest bin full, find non empty bind
                target=undefined;
                for (var i in creep.room.memory.destBins){
                    target = Game.getObjectById(creep.room.memory.destBins[i]);
                    if ((target.energy<target.energyCapacity)||(target.store<target.storeCapacity)){
                        creep.memory.targetDest=target.id;
                        foundBin=true;
                        return target;
                    }
                }
            } else { // closest destination bin not full
                creep.memory.targetDest=target.id;
                foundBin=true;
                return target;
            }
        } 
        if(!foundBin){
            if(creep.room.name!=creep.memory.spawnRoom){
                var myRoom=Game.rooms[creep.memory.spawnRoom]
                destBins=[];
                for(var i in myRoom.memory.destBins){
                    var destBin=Game.getObjectById(myRoom.memory.destBins[i]);
                    if(destBin && !containerAtCap(destBin)){
                        destBins.push(destBin);
                    }
                }
                var target = creep.pos.findClosestByRange(destBins);
                if(target){
                    creep.memory.targetDest=target.id;
                    return target;
                } else{
                    var targets = myRoom.find(FIND_STRUCTURES, {
                        filter: (structure) => {
                             return (structure.structureType == STRUCTURE_STORAGE)
                        }
                    });
                    if(targets.length){
                        if(targets[0].store[RESOURCE_ENERGY]<targets[0].storeCapacity){
                            creep.memory.targetDest=targets[0].id;
                            return targets[0];  
                        }
                    }
                }
            }
        }
    }
}
function findSource(creep) { 
    //console.log('find')
    creep.memory.pickupFlag=false;
    var sourceBins=[];
    for(var i in creep.room.memory.sourceBins){
        var sourceBin=Game.getObjectById(creep.room.memory.sourceBins[i]);
        if(sourceBin){
            sourceBins.push(sourceBin);
        }
    }                                                   //find dropped energy
    creep.memory.pickupFlag=false;
    var targets = creep.room.find(FIND_DROPPED_ENERGY)
    if(targets.length){
        var target = creep.pos.findClosestByRange(targets); 
        //console.log(target.energy)
        if(target != undefined && target.energy>0){
            creep.memory.targetSource=target.id;
            creep.memory.pickupFlag=true;
            return target;
        }
    } else {                                            // find source bin  
        var target = creep.pos.findClosestByRange(sourceBins);
        if (target==null){
            creep.say("no sources");
        } else if(target.store[RESOURCE_ENERGY]==0){ // closest bin empty
            for (var i in creep.room.memory.sourceBins){                //find any empty bin
                target = Game.getObjectById(creep.room.memory.sourceBins[i]);
                if (target && target.store[RESOURCE_ENERGY]>0){ 
                    creep.memory.targetSource=target.id;
                    return target
                }
            }
        } else { // closest destination bin not full
            creep.memory.targetSource=target.id;
            return target;
        }
    }
}
function containerAtCap(structure){
    var atCap;
    if(structure.structureType==STRUCTURE_EXTENSION || structure.structureType==STRUCTURE_SPAWN || structure.structureType==STRUCTURE_TOWER || structure.structureType==STRUCTURE_LINK){
        if (structure.energy==structure.energyCapacity){
            atCap=true;
        } else {
            atCap=false;
        }
    } else if (structure.structureType==STRUCTURE_CONTAINER || structure.structureType==STRUCTURE_STORAGE){
         if (structure.store[RESOURCE_ENERGY]==structure.storeCapacity){
            atCap=true;
        } else {
            atCap=false;
        }
    } 
    return atCap;
}
function containerEmpty(structure){
    var empty;
    if(structure==null){
        empty=true;
    } else if(structure.structureType==STRUCTURE_EXTENSION || structure.structureType==STRUCTURE_SPAWN || structure.structureType==STRUCTURE_TOWER || structure.structureType==STRUCTURE_LINK){
        if (structure.energy==0){
            empty=true;
        } else {
            empty=false;
        }
    } else if (structure.structureType==STRUCTURE_CONTAINER || structure.structureType==STRUCTURE_STORAGE){
         if (structure.store[RESOURCE_ENERGY]==0){
            empty=true;
        } else {
            empty=false;
        }
    } 
    return empty;
}
function makeBestBody(cap){
    var body = [];
    if(cap<300){   // under 300
        body = makeParts(1,1,0)
    } else if(cap<400){   // 300-399
        body = makeParts(2,4,0)
    } else if(cap<550){   // 400-549
        body = makeParts(3,6,0)
    } else if(cap<800){   // 550-799
        body = makeParts(4,8,0)
    } else if(cap<1300){   // 800-1299
        body = makeParts(5,10,0)
    } else if(cap<1800){   // 1300-1799
        body = makeParts(6,12,0)
    } else if(cap<2300){   // 1800-2299
        body = makeParts(7,14,0)
    } else {   // 2300+
        body = makeParts(8,16,0)
    }
    return body;
}
function makeParts(moves, carries, works) {
    var list = [];
    for(var i=0;i<moves;i++){
        list.push(MOVE);
    }
    for(var i=0;i<carries;i++){
        list.push(CARRY);
    }
    for(var i=0;i<works;i++){
        list.push(WORK);
    }
    return list;
}
function init(creep) {
    console.log("Initializing Mover - "+creep.name);
    creep.memory.init = true;
    creep.memory.role = "mover";
    creep.memory.spawnRoom = creep.room.name;
	//creep.memory.sourceBin==undefined;
	//creep.memory.destBin=undefined;
	creep.memory.targetSource = undefined;
    creep.memory.targetDest = undefined;
	creep.memory.state = "acquireEnergy";
	if(creep.memory.sourceBin!=undefined){      // set array with your name
	    var myBin = Game.getObjectById(creep.memory.sourceBin);
	    for (var i in myBin.room.memory.sourceBins){
	        var src=myBin.room.memory.sourceBins[i];
	        if(src==creep.memory.sourceBin){
	            myBin.room.memory.moverNames[i]=creep.name;
	        }
	    }
	} else {
	    //console.log("spawning miner with no target")
	}
}
module.exports = roleMover;
// ---------------------------------------------------------------- role.mover ----------------------------------------------------------------



