//cpi double contract

use solana_program::{account_info::{AccountInfo, next_account_info}, entrypoint::ProgramResult, entrypoint, instruction::{AccountMeta, Instruction}, program::invoke, pubkey::Pubkey};

entrypoint!(process_instruction);

fn process_instruction(
    publicKey: &Pubkey,
    accounts: &[AccountInfo],
    instruction_data: &[u8]
) -> ProgramResult {
    let mut iter = accounts.iter();
    let data_account = next_account_info(&mut iter)?;
    let double_cont_account = next_account_info(&mut iter)?;

    let instruction = Instruction{
        program_id: *double_cont_account.key,
        accounts: vec![AccountMeta{
            is_signer: true,
            is_writable: true,
            pubkey: *data_account.key
        }],
        data: vec![]
    };

    invoke(&instruction, &[data_account.clone()])?;
    Ok(())
}







// double contract-----------------------------------------------------

// use borsh::{BorshDeserialize, BorshSerialize};
// use solana_program::{account_info::{AccountInfo, next_account_info}, entrypoint::ProgramResult, pubkey::Pubkey, entrypoint};

// entrypoint!(process_instruction);

// #[derive(BorshDeserialize, BorshSerialize)]
// struct OnChainData {
//     count: u32
// }

// fn process_instruction(
//     program_id: &Pubkey,
//     accounts: &[AccountInfo],
//     instruction_data: &[u8]
// ) -> ProgramResult {
//     let mut iter = accounts.iter();
//     let data_account = next_account_info(&mut iter)?;

//     let mut counter = OnChainData::try_from_slice(&data_account.data.borrow_mut())?; 

//     if counter.count == 0 {
//         counter.count = 1;
//     }else {
//         counter.count = counter.count * 2;
//     }

//     counter.serialize(&mut *data_account.data.borrow_mut());
    
//     Ok(())
// }