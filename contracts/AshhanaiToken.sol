// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract AshhanaiToken {

	/**
	 * @dev This method can be used to improve usability, but interfaces and other contracts MUST NOT expect these values to be present.
	 */
	string public name = "Ashhanai Token";

	/**
	 * @dev This method can be used to improve usability, but interfaces and other contracts MUST NOT expect these values to be present.
     */
	string public symbol = "ASHT";

	/**
	 * @dev This method can be used to improve usability, but interfaces and other contracts MUST NOT expect these values to be present.
     */
	uint8 public decimals = 18;

	/**
     * @dev Returns the total token supply.
     */
	uint256 public totalSupply;

	/**
	 * @dev Returns the account balance of another account with address _owner.
	 */
	mapping (address => uint256) public balanceOf;

	/**
	 * @dev Returns the amount which _spender is still allowed to withdraw from _owner.
	 */
	mapping (address => mapping (address => uint256)) public allowance;


	// EVENTS

	/**
     * @dev A token contract which creates new tokens SHOULD trigger a Transfer event with the _from address set to 0x0 when tokens are created.
     */
    event Transfer(address indexed _from, address indexed _to, uint256 _value);

    /**
     * @dev MUST trigger on any successful call to approve(address _spender, uint256 _value).
     */
    event Approval(address indexed _owner, address indexed _spender, uint256 _value);


    // CONSTRUCTOR

    constructor(uint256 _initialSupply) {
    	balanceOf[msg.sender] = _initialSupply;
    	totalSupply = _initialSupply;

    	emit Transfer(address(0), msg.sender, _initialSupply);
    }


    // MANDATORY

    /**
     * @dev Transfers _value amount of tokens to address _to, and MUST fire the Transfer event.
     * The function SHOULD throw if the message caller’s account balance does not have enough tokens to spend.
     * 
     * Note Transfers of 0 values MUST be treated as normal transfers and fire the Transfer event.
     */
    function transfer(address _to, uint256 _value) external returns (bool) {
    	require(balanceOf[msg.sender] >= _value, "Insufficient balance");

    	balanceOf[msg.sender] -= _value; // Cannot underflow (first require check)
    	balanceOf[_to] += _value; // sol ^0.8.0 automatically checks under/overflows

    	emit Transfer(msg.sender, _to, _value);

		return true;
    }

    /**
     * @dev Transfers _value amount of tokens from address _from to address _to, and MUST fire the Transfer event.
     * 
     * The transferFrom method is used for a withdraw workflow, allowing contracts to transfer tokens on your behalf.
     * This can be used for example to allow a contract to transfer tokens on your behalf and/or to charge fees in sub-currencies.
     * The function SHOULD throw unless the _from account has deliberately authorized the sender of the message via some mechanism.
     * 
     * Note Transfers of 0 values MUST be treated as normal transfers and fire the Transfer event.
     */
    function transferFrom(address _from, address _to, uint256 _value) external returns (bool) {
    	require(balanceOf[_from] >= _value, "Unsufficient balance");
    	require(allowance[_from][_to] >= _value, "Unsufficient allowance");

    	balanceOf[_from] -= _value; // Cannot underflow (first require check)
    	balanceOf[_to] += _value; // sol ^0.8.0 automatically checks under/overflows
    	allowance[_from][_to] -= _value; // Cannot underflow (second require check)

    	emit Transfer(_from, _to, _value);

		return true;
    }

    /**
     * @dev Allows _spender to withdraw from your account multiple times, up to the _value amount. 
     * If this function is called again it overwrites the current allowance with _value.
     * 
     * NOTE: To prevent attack vectors like the one described here and discussed here, clients SHOULD make sure to create user interfaces in such a way that they set the allowance first to 0 before setting it to another value for the same spender.
     * THOUGH The contract itself shouldn’t enforce it, to allow backwards compatibility with contracts deployed before
     */
    function approve(address _spender, uint256 _value) external returns (bool) {
    	allowance[msg.sender][_spender] = _value;

    	emit Approval(msg.sender, _spender, _value);

    	return true;
    }

}
