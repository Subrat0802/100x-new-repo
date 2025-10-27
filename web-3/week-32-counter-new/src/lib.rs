use solana_program::{
    account_info::{next_account_info, AccountInfo},
    entrypoint,
    entrypoint::ProgramResult,
    msg,
    pubkey::Pubkey,
};
use borsh::{BorshDeserialize, BorshSerialize};

entrypoint!(process_instruction);

#[derive(BorshDeserialize, BorshSerialize, Debug)]
struct Counter {
    count: u32,
}

#[derive(BorshDeserialize, BorshSerialize, Debug)]
enum CounterInstruction {
    Increment(u32),
    Decrement(u32),
}

fn process_instruction(
    _program_id: &Pubkey,
    accounts: &[AccountInfo],
    instruction_data: &[u8],
) -> ProgramResult {
    // Get the first account
    let accounts_iter = &mut accounts.iter();
    let account = next_account_info(accounts_iter)?;

    // Deserialize the counter state
    let mut counter = Counter::try_from_slice(&account.data.borrow())?;

    // Deserialize the incoming instruction
    match CounterInstruction::try_from_slice(instruction_data)? {
        CounterInstruction::Decrement(amount) => {
            counter.count = counter.count.saturating_sub(amount);
            msg!("Decremented counter by {}", amount);
        }
        CounterInstruction::Increment(amount) => {
            counter.count = counter.count.saturating_add(amount);
            msg!("Incremented counter by {}", amount);
        }
    }

    // Serialize the updated counter back into the account data
    counter.serialize(&mut *account.data.borrow_mut())?;

    msg!("Counter updated to {}", counter.count);

    Ok(())
}
