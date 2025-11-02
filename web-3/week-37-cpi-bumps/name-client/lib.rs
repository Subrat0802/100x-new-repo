use solana_program::{
    account_info::{next_account_info, AccountInfo},
    entrypoint,
    entrypoint::ProgramResult,
    program::invoke_signed,
    pubkey::Pubkey,
    system_instruction::create_account,
};

entrypoint!(process_instruction);

fn process_instruction(
    program_id: &Pubkey,
    accounts: &[AccountInfo],
    _instruction_data: &[u8],
) -> ProgramResult {
    // Create a new PDA onchain: [PDA, User Account, System Program]
    let iter = &mut accounts.iter();
    let pda = next_account_info(iter)?;
    let user_acc = next_account_info(iter)?;
    let system_program = next_account_info(iter)?;

    let seeds: &[&[u8]] = &[user_acc.key.as_ref(), b"user"];
    let (pda_public_key, bump) = Pubkey::find_program_address(seeds, program_id);

    let ix = create_account(
        user_acc.key,
        pda.key,
        1_000_000_000,
        8,
        program_id,
    );

    invoke_signed(
        &ix,
        &[user_acc.clone(), pda.clone(), system_program.clone()],
        &[&[user_acc.key.as_ref(), b"user", &[bump]]],
    )?;

    Ok(())
}
