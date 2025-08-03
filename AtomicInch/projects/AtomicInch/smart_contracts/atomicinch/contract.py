from algopy import logicsig, op, Global, Txn, UInt64, Bytes

SENDER_ADDRESS = Bytes(b"YOUR_SENDER_ADDRESS_HERE")

@logicsig
def hash_timelock_lsig() -> bool:
    """
    LogicSig contract that implements a hashlock and timelock.
    - arg_0: expected SHA-256 hash of the secret (bytes)
    - arg_1: timelock (uint64, as int)
    - arg_2: secret (bytes)
    
    If the current timestamp is after the timelock, only the sender can claim.
    Before the timelock, the secret must be revealed to claim.
    """
    latest_timestamp = Global.latest_timestamp
    timelock = UInt64(op.arg(1))  
    sender = Txn.sender

    # After timelock, allow only the sender to claim
    if latest_timestamp >= timelock:
        # NOTE: The knowledge sources do not specify how to compare Account and Bytes types.
        # This comparison may not work as intended without further documentation.
        return sender == SENDER_ADDRESS

    # Before timelock, require the correct secret (hashlock)
    secret = op.arg(2)
    hash_of_secret = op.sha256(secret)
    expected_hash = op.arg(0)
    return hash_of_secret == expected_hash
