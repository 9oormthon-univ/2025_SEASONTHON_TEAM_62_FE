import { IcSvgSearch } from '../icons';
import type { ChangeEvent } from 'react';

interface InputProps {
  value: string;
  placeholder?: string;
  onChange: (e: ChangeEvent<HTMLInputElement>) => void;
  onSubmit: () => void;
}

const Input = ({ value, placeholder, onChange, onSubmit }: InputProps) => {
  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        onSubmit();
      }}
    >
      <div className="flex px-4 gap-1 justify-center items-center">
        <input
          className="border border-gray3 focus:text-black focus:outline-none focus:border-black w-full font-normal text-4 px-5 py-[0.5625rem] rounded-[8px]"
          value={value}
          placeholder={placeholder}
          onChange={onChange}
          aria-label={placeholder ?? '검색어'}
        />
        <button
          className="bg-main1 px-[0.375rem] py-[0.375rem] rounded-[8px] text-white"
          type="submit"
          aria-label="검색"
        >
          <IcSvgSearch
            width="28px"
            height="28px"
          />
        </button>
      </div>
    </form>
  );
};

export default Input;
