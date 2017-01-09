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
	if(creep.memory.sourceBin==undefined){
	    creep.memory.sourceBin="";
	}
	if(creep.memory.destBin==undefined){
	    creep.memory.destBin="";
	}
	if(creep.memory.targetSource==undefined){
	    creep.memory.targetSource="";
	}
	if(creep.memory.targetDest==undefined){
	    creep.memory.targetDest="";
	}
}
function work(creep) {
	if(creep.memory.state == "voyageOutOfRoom"){
		voyageOutOfRoom(creep);
	} else if(creep.memory.state == "aquireEnergy"){
		aquireEnergy(creep);
	} else if(creep.memory.state == "dumpEnergy"){
	    dumpEnergy(creep);
	}
}
function aquireEnergy(creep) {
    var target;
    if(creep.memory.sourceBin==""){
        if(creep.memory.targetSource=""){
            target = findSource(creep);
        } else {
            target = Game.getObjectById(creep.memory.targetSource);
        }
    } else {
        target = Game.getObjectById(creep.memory.sourceBin);
    }
    if(creep.energy==creep.energyCapacity){
        creep.memory.targetSource=""
        creep.memory.state = "dumpEnergy";
    }
    if(target){
        moveToPickup(creep,target);
    }
}
function dumpEnergy(creep) {
    var target;
    if(creep.memory.desteBin==""){
        if(creep.memory.targetDest=""){
            target = findDest(creep);
        } else {
            target = Game.getObjectById(creep.memory.targetDest);
        }
    } else {
        target = Game.getObjectById(creep.memory.destBin);
    }
    
    if(target.energy==0){
        creep.memory.targetDest="";
        creep.memory.state = "acquireEnergy";
    }
    if(target){
        moveToTransfer(creep,target);
    }
}
function voyageOutOfRoom(creep,destRoom) {
    var exitDir = Game.map.findExit(creep.room.name, destRoom);
    var Exit = creep.pos.findClosestByPath(exitDir);
    creep.moveTo(Exit);
}
function moveToPickup(creep,target) {
    if(target.energy<target.energyCapacity){
        if(creep.room.name==target.room.name){
            if(creep.pickup(target, RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) {
                    creep.moveTo(target);
            }
        } else {
            voyageOutOfRoom(creep,target.room)
        }
    } else {
        findSource(creep);
    }
}
function moveToTransfer(creep,target) {
    if(target.energy<target.energyCapacity){
        if(creep.room.name==target.room.name){
            if(creep.transfer(target, RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) {
                    creep.moveTo(target);
            }
        } else {
            voyageOutOfRoom(creep,target.room)
        }
        
    } else {
        findDest(creep);
    }
}
function findDest(creep) {
    //    stuff that really needs energy
    var targets = creep.room.find(FIND_STRUCTURES, {
        filter: (structure) => {
             return ((structure.structureType == STRUCTURE_EXTENSION || structure.structureType == STRUCTURE_SPAWN) && (structure.energy < structure.energyCapacity) ||
                (structure.structureType == STRUCTURE_TOWER) && (structure.energy < structure.energyCapacity*.75))
        }
    });
    if(targets){
        var target = creep.pos.findClosestByRange(targets);
        creep.memory.targetDest=target.id;
        return target;
    } else {     //   find a destination bin
        var target = creep.findClosestByRange(creep.room.memory.destBins);
        if (target.energy==target.energyCapacity){
            for (var i in creep.room.memory.destBins){
                target = Game.getObjectById(creep.room.memory.destBins[i]);
                if (target.energy<target.energyCapacity){
                    creep.memory.targetDest=target.id;
                    return target
                }
            }
        } else { // closest destination bin not full
            if(creep.memory.targetDest!=""){
                creep.memory.targetDest=target;
                return target;
            }
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
    }
    //find dropped energy
    var targets = creep.room.find(FIND_DROPPED_ENERGY, {
        filter: (structure) => { 
            return (structure.energy < structure.energyCapacity)
        }
    });
    if(targets){
        var target = creep.pos.findClosestByRange(targets);
        creep.memory.targetSource=target.id;
        return target;
    } else {     // find source bin  
        var target = creep.findClosestByRange(creep.room.memory.sourceBins);
        if (target.energy==0){
            for (var i in creep.room.memory.sourceBins){
                target = Game.getObjectById(creep.room.memory.sourceBins[i]);
                if (target){
                    if (target.energy<target.energyCapacity){
                    creep.memory.targetDest=target.id;
                    return target
                    }
                }
            }
        } else { // closest destination bin not full
           if(creep.memory.targetSource!=""){
                creep.memory.targetSource=target;
                return target;
            }
    }
}
module.exports = roleMover;
