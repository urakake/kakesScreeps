/** -------------------------------------------- role.mover ------------------------------------------
 * @param {Creep} creep 
 * by Urakake     **/
		
var roleMover = {
    run: function(creep) {
        if(!creep.memory.init){
            init(creep);
        }
        work(creep);
	}
};
function init(creep) {
    console.log("Initializing Mover - "+creep.name);
    creep.memory.init=true;
	//creep.memory.sourceBin==undefined;
	//creep.memory.destBin=undefined;
	creep.memory.targetSource=undefined;
    creep.memory.targetDest=undefined;
	creep.memory.state = "acquireEnergy";
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
            if((target.energy==target.energyCapacity)||(target.store==target.storeCapacity)){
                target = findSource(creep);
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
    if(target.store[RESOURCE_ENERGY]>0){
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
        if(destBin){
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
    
        var target = creep.pos.findClosestByRange(destBins);
        if (target.store[RESOURCE_ENERGY]==target.storeCapacity[RESOURCE_ENERGY]){
            
            for (var i in creep.room.memory.destBins){
                target = Game.getObjectById(creep.room.memory.destBins[i]);
                if ((target.energy<target.energyCapacity)||(target.store<target.storeCapacity)){
                    creep.memory.targetDest=target.id;
                    return target;
                }
            }
        } else { // closest destination bin not full
            creep.memory.targetDest=target.id;
            return target;
        }
    }
}
function findSource(creep) { 
    var sourceBins=[];
    for(var i in creep.room.memory.sourceBins){
        var sourceBin=Game.getObjectById(creep.room.memory.sourceBins[i]);
        if(sourceBin){
            sourceBins.push(sourceBin);
        }
    }                                                   //find dropped energy
    creep.memory.pickupFlag=false;
    var targets = creep.room.find(FIND_DROPPED_ENERGY, {
        filter: (structure) => { 
            return (structure.energy < structure.energyCapacity)
        }
    });
    if(targets.length){
        var target = creep.pos.findClosestByRange(targets);
        creep.memory.targetSource=target.id;
        creep.memory.pickupFlag=true;
        return target;
    } else {                                            // find source bin  
        var target = creep.pos.findClosestByRange(sourceBins);
        if (target==null){
            console.log("no sources")
        } else if(target.store[RESOURCE_ENERGY]==target.storeCapacity){ // closest bin full 
            for (var i in creep.room.memory.sourceBins){                //find any empty bin
                target = Game.getObjectById(creep.room.memory.sourceBins[i]);
                if (target && target.store[RESOURCE_ENERGY]>0){ 
                    creep.memory.targetDest=target.id;
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
module.exports = roleMover;
