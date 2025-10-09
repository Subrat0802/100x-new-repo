use solana_program::{
    account_info::{AccountInfo, next_account_info},
    entrypoint::ProgramResult,
    entrypoint,
    program::invoke_signed,
    pubkey::Pubkey,
    system_instruction::create_account,
};

entrypoint!(process_instrcution);

fn process_instrcution(
    program_id: &Pubkey,
    accounts: &[AccountInfo],
    instruction_data: &[u8]
) -> ProgramResult {
    //create a new pda ionchain
    //pda, userAcc, systemProgram
    let iter = &mut accounts.iter();
    let pda= next_account_info(iter)?;
    let user_acc = next_account_info(iter)?;
    let system_program = next_account_info(iter)?;

    

    let seeds = &[user_acc.key.as_ref(), b"user"];

    let (pda_public_key, bump) = Pubkey::find_program_address(seeds, program_id);

    let ix = create_account(user_acc.key, pda.key, 1000000000, 8, program_id);

    invoke_signed(&ix, accounts, &[&[seeds, &[bump]]]);

    Ok(())
}


//


// use solana_program::{
//     account_info::{AccountInfo, next_account_info},
//     entrypoint,
//     entrypoint::ProgramResult,
//     program::invoke_signed,
//     pubkey::Pubkey,
//     system_instruction,
//     sysvar::{rent::Rent, Sysvar},
// };

// entrypoint!(process_instruction);

// fn process_instruction(
//     program_id: &Pubkey,
//     accounts: &[AccountInfo],
//     _instruction_data: &[u8],
// ) -> ProgramResult {
//     let account_info_iter = &mut accounts.iter();
//     let pda = next_account_info(account_info_iter)?;       // PDA account
//     let user_acc = next_account_info(account_info_iter)?;  // payer
//     let system_program = next_account_info(account_info_iter)?; 

//     // Derive PDA
//     let (derived_pda, bump) = Pubkey::find_program_address(
//         &[user_acc.key.as_ref(), b"user"],
//         program_id,
//     );

//     assert_eq!(&derived_pda, pda.key);

//     // Rent-exempt lamports
//     let space: usize = 8;
//     let rent = Rent::get()?;
//     let lamports = rent.minimum_balance(space);

//     // Create PDA account
//     let ix = system_instruction::create_account(
//         user_acc.key,
//         pda.key,
//         lamports,
//         space as u64,
//         program_id,
//     );

//     // Signer seeds
//     let signer_seeds: &[&[u8]] = &[
//         user_acc.key.as_ref(),
//         b"user",
//         &[bump],
//     ];

//     // Invoke with signer
//     invoke_signed(
//         &ix,
//         &[
//             user_acc.clone(),
//             pda.clone(),
//             system_program.clone(),
//         ],
//         &[signer_seeds],
//     )?;

//     Ok(())
// }
