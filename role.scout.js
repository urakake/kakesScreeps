/** -------------------------------------------- role.scout ------------------------------------------
 * @param {Creep} creep 
 * Game.spawns('Spawn1').
 * by Urakake     **/
		
var roleScout = {
     run: function(creep) {
        if(!creep.memory.init){
            init(creep);
        }
        work(creep);
	}
};
function init(creep) {
    console.log("Initializing Scout - "+creep.name);
    creep.memory.init=true;
    if(creep.memory.targetRoom==undefined){
	    creep.memory.targetRoom="none";
	}
	if(creep.memory.role==undefined){
	    creep.memory.role="scout";
	}
	creep.memory.contX=25;
    creep.memory.contY=25;
	creep.memory.state="traverse"
	creep.memory.targetSource=undefined;
}
function work(creep) {
	if(creep.memory.state == "traverse") {
	    traverse(creep);
	} else if(creep.memory.state == "acquireEnergy"){
	    acquireEnergy(creep)
	} else if(creep.memory.state == "dumpEnergy"){
		dumpEnergy(creep)
	}
}
function traverse(creep){
    var targetRoom=creep.memory.targetRoom
    if(creep.room.name != targetRoom){
        voyageOutOfRoom(creep,targetRoom);
    } else {
        creep.memory.state = "aquireEnergy";
        work(creep)
    }
}
function acquireEnergy(creep){
    if(creep.memory.targetSource==undefined){
        var target=findSource(creep);
        if(target!=undefined){
            creep.memory.targetSource=target.id
        }
    }
    var target=Game.getObjectById(creep.memory.targetSource);
    if(target!=undefined){
        moveToGetTransfer(creep,target);
    } else {
        console.log('undefined')
    }
    if(creep.carry.energy==creep.carryCapacity){
        creep.memory.state="dumpEnergy"
    }
}
function dumpEnergy(creep){
    var targets = creep.room.find(FIND_STRUCTURES, {
            filter: (structure) => {
                 return ((structure.structureType == STRUCTURE_EXTENSION || structure.structureType == STRUCTURE_SPAWN) && (structure.energy < structure.energyCapacity) ||
                    (structure.structureType == STRUCTURE_TOWER) && (structure.energy < structure.energyCapacity*.8))
            }
    });
    if(targets.length) {
            creep.memory.targetEnergy=creep.pos.findClosestByRange(targets).id;
			creep.memory.state = "storeInBuilders";
	} else {
		var targets = creep.room.find(FIND_CONSTRUCTION_SITES);
		if(targets.length) {
			creep.memory.state = "buildSite";
		} else if(creep.room.controller.level!=8) {
			creep.memory.state = "upgradeController";
		} else {
		    creep.memory.state = "dump";
			creep.say('dump');
		}
	}
}
function buildSite(creep){
    var targets = creep.room.find(FIND_CONSTRUCTION_SITES);
    if(targets.length) {
        if(creep.build(targets[0]) == ERR_NOT_IN_RANGE) {
            creep.moveTo(targets[0]);
        }
    } else {
        if(creep.carry.energy==0) {
            creep.memory.state = "acquireEnergy";
        } else {
            creep.memory.state = "find";
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
function voyageOutOfRoom(creep,destRoom) {
    var exitDir = Game.map.findExit(creep.room.name, destRoom);
    var Exit = creep.pos.findClosestByPath(exitDir);
    creep.moveTo(Exit);
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








module.exports = roleScout;