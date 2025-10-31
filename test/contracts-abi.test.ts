import { describe, it, expect } from 'vitest';
import { ABIS, CONTRACTS } from '@/config/contracts';
import { getAddress } from 'viem';

describe('FHELottery ABI', () => {
  const lotteryAbi = ABIS.FHELottery;

  it('defines buyTicket with encrypted parameters', () => {
    const buyTicket = lotteryAbi.find(
      (entry) => entry.type === 'function' && entry.name === 'buyTicket',
    );

    expect(buyTicket).toBeDefined();
    expect(buyTicket?.inputs?.map((input) => input.type)).toEqual([
      'uint256',
      'bytes32',
      'bytes',
    ]);
  });

  it('exposes round insights via getRound', () => {
    const getRound = lotteryAbi.find(
      (entry) => entry.type === 'function' && entry.name === 'getRound',
    );

    expect(getRound).toBeDefined();
    expect(getRound?.outputs?.map((output) => output.type)).toEqual([
      'string',
      'uint32',
      'uint256',
      'bool',
      'uint256',
    ]);
  });

  it('includes lifecycle events for tickets and rounds', () => {
    const expectedEvents = ['RoundCreated', 'TicketBought', 'RoundDrawn', 'PrizeClaimed'];

    for (const eventName of expectedEvents) {
      const event = lotteryAbi.find(
        (entry) => entry.type === 'event' && entry.name === eventName,
      );
      expect(event, `missing event ${eventName}`).toBeDefined();
    }
  });
});

describe('FHELottery contract address', () => {
  it('is a valid checksum address', () => {
    const address = CONTRACTS.FHELottery;
    expect(getAddress(address)).toBe(address);
  });
});
