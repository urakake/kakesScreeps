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
	creep.memory.targetSource="";
    creep.memory.targetDest="";
	creep.memory.state = "aquireEnergy";
}
function work(creep) {
    if(creep.memory.state == "aquireEnergy"){
		aquireEnergy(creep);
	} else if(creep.memory.state == "dumpEnergy"){
	    dumpEnergy(creep);
	}
}
function aquireEnergy(creep) {
    var target;
    if(creep.memory.sourceBin==""){
        if(creep.memory.targetSource==""){
            
            target = findSource(creep);
        } else {
            target = Game.getObjectById(creep.memory.targetSource);
        }
    } else {
        target = Game.getObjectById(creep.memory.sourceBin);
    }
    if(target){
        
        if(creep.memory.pickupFlag){
            moveToPickup(creep,target);
        } else {
            moveToGetTransfer(creep,target);
        }
    }
    
    if(creep.carry.energy==creep.carryCapacity){
        creep.memory.targetSource=""
        creep.memory.state = "dumpEnergy";
    }
}
function dumpEnergy(creep) {
    var target;
    if(creep.memory.destBin==""){
        
        if(creep.memory.targetDest==""){
            
            target = findDest(creep);
        } else {
            target = Game.getObjectById(creep.memory.targetDest);
            //console.log(creep.memory.targetDest)
        }
    } else {
        target = Game.getObjectById(creep.memory.destBin);
    }
    
    if(target){
        
        moveToGiveTransfer(creep,target);
    }
    if(creep.carry.energy==0){
        creep.memory.targetDest="";
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
                    
            }
        } else {
            voyageOutOfRoom(creep,target.room)
        }
    } else {
        creep.memory.targetSource="";
        //findSource(creep);
    }
}
function moveToGetTransfer(creep,target) {
    //console.log("hit")
    //console.log(target.store[RESOURCE_ENERGY]+" = "+target.storeCapacity)
    if(target.store[RESOURCE_ENERGY]<target.storeCapacity){
        if(creep.room.name==target.room.name){
            if(target.transfer(creep, RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) {
                    creep.moveTo(target);
            }
        } else {
            voyageOutOfRoom(creep,target.room)
        }
        
    } else {
        
        creep.memory.targetSource="";
        //destination full
    }
}
function moveToGiveTransfer(creep,target) {
    //console.log(target)
    if((target.structureType==(STRUCTURE_EXTENSION || STRUCTURE_TOWER || STRUCTURE_SPAWN) && target.energy<target.energyCapacity) ||
        (target.structureType==(STRUCTURE_LINK || STRUCTURE_STORAGE || STRUCTURE_CONTAINER) && target.store[RESOURCE_ENERGY]<target.storeCapacity)){
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
    //creep.say("find dest")
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
        console.log(targets.length)
        creep.memory.targetDest=target.id;
        return target;
    } else {     //   find a destination bin
        var target = creep.pos.findClosestByRange(destBins);
        if (target.store[RESOURCE_ENERGY]==target.storeCapacity[RESOURCE_ENERGY]){
            for (var i in creep.room.memory.destBins){
                target = Game.getObjectById(creep.room.memory.destBins[i]);
                if (target.energy<target.energyCapacity){
                    creep.memory.targetDest=target.id;
                    return target;
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
    } else {     // find source bin  
    
        var target = creep.pos.findClosestByRange(sourceBins);
        if (target==null){
            console.log("no sources")
        } else if(target.store[RESOURCE_ENERGY]==0){
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
            //console.log(target.id)
            creep.memory.targetSource=target.id;
            return target;
        }
    }
}
module.exports = roleMover;
